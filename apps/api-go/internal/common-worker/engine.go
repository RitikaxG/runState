package worker

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
)

/* Engine is a long running worker runner. Its the Runtime that powers a worker
 */
type Engine struct {
	Redis *redis.Redis

	/* Stream & Consumer group metadata
	- Defines where and how worker reads messages
	*/
	Stream   string
	Group    string
	Consumer string

	Handler Handler

	/* Batch & Blocking controls
	- These tune performance and cost
	*/
	// BatchSize int
	// BlockTime time.Duration

	/* Concurrency and In-Flight tracking
	- Ensures safe shutdown and correctness
	*/
	wg       sync.WaitGroup
	inFlight int
	mu       sync.Mutex

	/*
		Why context and cancel ?
			- To stop reading new messages
			- Signal handlers to stop
			- Respect timeouts
			- Propogate shutdown to goroutines
	*/
	ctx    context.Context
	cancel context.CancelFunc

	stopHeartBeat func()
}

/*
	 Engine Constructor
		- This function's job is to create, initialise , return a ready to run Engine
		- NewEngine create a worker runtime, wire all its dependencies, and give it a kill switch —
		but don’t start it yet.
*/
func NewEngine(
	redis *redis.Redis,
	stream, group, consumer string,
	handler Handler,
) *Engine {
	/*
		- context.Background() is the root context that never cancels on its own.
		- context.WithCancel() creates a derived context (ctx) and a cancel function ( cancel )
		- calling cancel() with close ctx.Done() nd signal all goroutines using this ctx to stop

		Its done since engine must be able to stop everything it started. Handlers recieves this context.
	*/
	ctx, cancel := context.WithCancel(context.Background())

	return &Engine{
		Redis:    redis,
		Stream:   stream,
		Group:    group,
		Consumer: consumer,
		Handler:  handler,
		ctx:      ctx,
		cancel:   cancel,
	}
}

/*
In-Flight tracking helpers

	- inFlight : how many messages are currently being processed right now

	- Why tracking in-flight is necessary ?
		* Because our engine is concurrent (goroutines), long running, needs graceful shutdown
		* You might otherwise kill a worker mid-process, redis msgs may stay unacknowleged forever

	- Why sync.Mutex ?
		* So that only one goroutine can touch inFlight at a time
*/

/*
Locks the mutex
Incr the counter
Unlocks the mutex
*/
func (e *Engine) incInFlight() {
	e.mu.Lock()
	e.inFlight++
	e.mu.Unlock()
}

// Signals that one message finished processing
func (e *Engine) decInFlight() {
	e.mu.Lock()
	e.inFlight--
	e.mu.Unlock()
}

/*
Reads the current count.
Why defer ?
  - Guarantees unlock even if function grows later.
*/
func (e *Engine) InFlight() int {
	e.mu.Lock()
	defer e.mu.Unlock()
	return e.inFlight
}

/*
startRecliamLoop() function
  - Optionally starts a background goroutine
  - That goroutine runs every 30 seconds
  - It calls Reclaim(...) on the engine’s handler
  - It automatically stops when the engine’s context is canceled
*/
func (e *Engine) startReclaimLoop() {
	// e.Handler.(Reclaimer) : Does e.Handler implements the Reclaimer interface
	reclaimer, ok := e.Handler.(Reclaimer)
	if !ok {
		return
	}

	go func() {
		/* A ticker is a periodic trigger
		- time.NewTicker sends current time into ticker.C every 30s forever
		- only ONE goroutine exists. The ticker does NOT stop every 30s. It keeps firing every
		 30s until the context is canceled.
		*/
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C: // when a value is recieves
				if err := reclaimer.Reclaim(e.ctx); err != nil {
					log.Println("reclaim failed", err)
				}
			case <-e.ctx.Done():
				return
			}
		}
	}()
}

// Main Run Loop

func (e *Engine) Run() error {
	// Ensure consumer group
	if err := e.Redis.EnsureConsumerGroup(
		e.ctx,
		e.Stream,
		e.Group,
	); err != nil {
		return err
	}

	e.startHeartBeat()
	e.startReclaimLoop()

	// Run must loop untile context cancellation
	for {
		select {
		case <-e.ctx.Done():
			return nil
		default:
			responses, err := e.Redis.XReadGroup(
				e.ctx,
				e.Stream,
				e.Group,
				e.Consumer,
			)

			if err != nil {
				return err
			}

			if len(responses) == 0 {
				continue
			}

			for _, response := range responses {
				e.processBatch(response.Message)
			}
		}
	}
}

/*
safeHandle calls h.Handle(...) and recovers from any panic, returning it as an error
instead of crashing the program.
*/
func safeHandle(
	h Handler,
	ctx context.Context,
	msg domain.StreamMessage,
	/*

		Why named return is required ?
			Deferred functions run after the return value is set
			But before the function actually returns
			Only named return values can be modified at that point
	*/
) (err error) {
	// deferred recovery function is registered

	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("panic in handler %s : %v", h.Name(), r)
		}
	}()
	/*

		If inside h.Handle(ctx, msg) a panic happens:
			panic("something bad")

			Then:
				- Normal execution stops
				- Deferred function runs
				- recover() catches the panic value
				- r != nil
				- err is set to:
					fmt.Errorf("panic in handler %s : %v", h.Name(), r)
				- Function returns normally with that error

			Panic → ❌ crash
			Panic → ✅ error return
	*/
	return h.Handle(ctx, msg) // Handle returns nil => err = nil , else err = that error
}

/*
  - Takes a batch of stream messages, processes them concurrently, tracks in-flight work,
    waits for all of them to finish, and then acknowledges some messages in Redis.
*/
func (e *Engine) processBatch(messages []domain.StreamMessage) {

	var (
		ackIds []string   // Collects msg IDs that should be acknowledged. ( Shared across goroutines, must be protected )
		mu     sync.Mutex // Guards concurrent writes to ackIds
		wg     sync.WaitGroup
	)

	for _, msg := range messages {
		/*
			This shadows the loop variable.

			Why this exists:
				- Go reuses the loop variable in range
				- Without this, all goroutines might see the same msg
				- This is the classic Go goroutine bug

			This line makes a per-iteration copy

		*/
		msg := msg
		e.incInFlight()
		wg.Add(1)

		go func() {
			defer e.decInFlight()
			defer wg.Done()

			err := safeHandle(e.Handler, e.ctx, msg)

			// Retry / DLQ decisions belong to handlers, not the engine.
			if err == nil {
				mu.Lock()
				ackIds = append(ackIds, msg.ID)
				mu.Unlock()
			}
		}()
	}

	wg.Wait()

	// Wait until this batch drains
	for e.InFlight() > 0 {
		time.Sleep(10 * time.Millisecond)
	}

	if len(ackIds) > 0 {
		_ = e.Redis.XAck(
			e.ctx,
			e.Stream,
			e.Group,
			ackIds,
			0, // engine does not track retries
		)
	}

}

// Graceful Shutdown

func (e *Engine) Stop(timeout time.Duration) {
	log.Println("Worker stop requested")
	e.cancel()

	if e.stopHeartBeat != nil {
		e.stopHeartBeat()
	}

	start := time.Now()

	for e.InFlight() > 0 {
		if time.Since(start) > timeout {
			log.Println("Forcing shuttdown with inflight", e.InFlight())
			return
		}
		time.Sleep(500 * time.Millisecond)
	}
	log.Println("Worker shutdown complete")
}

func (e *Engine) startHeartBeat() {
	meta := map[string]string{
		"stream":   e.Stream,
		"group":    e.Group,
		"consumer": e.Consumer,
	}

	e.stopHeartBeat = StartHeartBeat(
		e.ctx,
		e.Handler.Name(),
		10*time.Second,
		meta,
	)
}
