package monitoringpusher

import (
	"context"
	"encoding/json"
	"log"
	"os/signal"
	"syscall"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

const (
	pushInterval      = 3 * time.Minute
	heartbeatInterval = 10 * time.Second
	batchSize         = 200
)

/*
  - Emits structured, machine readable ogs describing the lifecycle or
    health of the monitoring pusher
*/
func (w *MonitoringPusher) logStatus(status string, signal string) {

	// Build a structured payload
	payload := map[string]string{
		"service":   "worker-monitoring-pusher",
		"status":    status,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	if signal != "" {
		payload["signal"] = signal
	}

	/* This converts the map into a JSON string like :

	{
	  "service": "worker-monitoring-pusher",
	  "status": "running",
	  "timestamp": "2026-02-04T06:45:12Z",
	  "signal": "SIGTERM"
	}

	*/

	b, _ := json.Marshal(payload)
	log.Println(string(b))
}

/*
  - pushOnce reads all websites from db, and pushes them as monitoring
    events into a Redis Stream, in batches and logs how long it took.
*/
func (w *MonitoringPusher) pushOnce(ctx context.Context) error {
	start := time.Now()

	websites, err := w.websites.ListAllWebsites(ctx)
	if err != nil {
		return err
	}

	/*
		- Convert list of `Website` domain objects into a list of `WebsiteEvent` objects
	*/

	// Pre-allocate slice
	events := make([]domain.WebsiteEvent, 0, len(websites))

	for _, site := range websites {
		events = append(events, domain.WebsiteEvent{
			WebsiteID: site.ID,
			URL:       site.URL,
		})
	}

	// Push to Redis stream
	if err := w.redis.XAddBulkMonitoringStream(
		ctx,
		w.stream,
		events,
		batchSize,
	); err != nil {
		return err
	}

	log.Printf(
		"Pushed %d website events in %d ms",
		len(events),
		time.Since(start).Milliseconds(),
	)

	return nil
}

/*
  - Starts a long running background worker that periodically pushes
    website events to a monitoring stream nd emits heartbeat until it is
    stopped.
*/
func (w *MonitoringPusher) Start(ctx context.Context) error {
	log.Println("Monitoring Pusher started")

	// how often to push websites
	pushTicker := time.NewTicker(pushInterval)

	// how often to say `I'm alive`
	heartbeatTicker := time.NewTicker(heartbeatInterval)

	// If Start ever returns, stop timers
	defer pushTicker.Stop()
	defer heartbeatTicker.Stop()

	// Runs forever
	for {
		select {

		// If ctx cancelled
		case <-ctx.Done():
			w.logStatus("STOPPED", "")

		case <-heartbeatTicker.C:
			w.logStatus("ALIVE", "")

		case <-pushTicker.C:
			if err := w.pushOnce(ctx); err != nil {
				log.Println("Pusher failed", err)
			}
		}
	}

}

/*
- Turns MonitoringPusher from a struct into a real OS-aware background process.
- It connects :
  - Unix signals
  - context cancellation
  - worker lifecycle
  - pusher logic
*/
func RunMonitoringPusher(
	websites repository.WebsiteRepository,
	redis *redis.Redis,
	stream string,
) error {
	/*
		- Listens for os signals
			- SIGINT : Ctrl + C
			- SIGTERM : container/system shutdown

		- When recieved :
			- ctx.Done() is closed
			- all context aware code reacts automatically
	*/
	ctx, stop := signal.NotifyContext(
		context.Background(),
		syscall.SIGINT,
		syscall.SIGTERM,
	)

	// Unregisters signal notifications, when function exists
	defer stop()

	/*
		Constructs the pusher
			- Dependencies are injected.
	*/
	pusher := NewMonitoringPusher(websites, redis, stream)

	pusher.logStatus("ALIVE", "")

	// Start the long running worker
	err := pusher.Start(ctx)

	pusher.logStatus("STOPPING", "")
	return err

}
