package redis

import (
	"context"
	"strings"
	"sync"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	goredis "github.com/redis/go-redis/v9"
)

func (r *Redis) xAddMonitoringEvent(
	ctx context.Context,
	stream string,
	websiteID string,
	url string,
) error {
	/* Go prefers explicit configuration via structs
	type XAddArgs struct {
		Stream       string
		ID           string
		Values       interface{}
		MaxLen       int64
		MaxLenApprox int64
	}
	*/
	args := &goredis.XAddArgs{
		Stream: stream,
		ID:     "*",
		/* Redis streams only store strings, but go doesn't know that at compile time.
		- goredis defines Values interface{} which allows
			* map[string]string
			* map[string]interface{}
			* []string ( raw form )

		- map[string]interface{} : means keys must be string, values can be any type
		*/
		Values: map[string]interface{}{
			"website_id": websiteID, // "websiteId" : Redis field, websiteID : Go field
			"url":        url,
		},
		MaxLen: 200_000,
		Approx: true, // strategy modifier
	}

	return r.Client.XAdd(ctx, args).Err()
}

func (r *Redis) XAddBulkMonitoringStream(
	ctx context.Context,
	stream string,
	websites []domain.WebsiteEvent,
	batchSize int,
) error {
	if batchSize <= 0 {
		batchSize = 200
	}

	for i := 0; i < len(websites); i += batchSize {
		end := i + batchSize
		if end > len(websites) {
			end = len(websites)
		}

		batch := websites[i:end]

		/*
			Waitgroup ( wg ) : How many goroutines are still working ?
				- Waitgroup gives you are counter shared safely between goroutines.

			Channel ( errCh ): How do goroutines report back ?
				- Waitgroup does not return values. It only answers : Are you done yet ?
				- That's why we introduce channels, a thread safe mailbox where goroutine can send msgs
				- We have Buffered Channel ( len(batch) ) since this prevents goroutine blocking
				- Buffered means , go routine can report error without waiting for a reader, avoids deadlocks

			Goroutines : Workers doing async job
		*/
		var wg sync.WaitGroup
		errCh := make(chan error, len(batch))

		for _, w := range batch {
			wg.Add(1) // One more task is starting

			go func(w domain.WebsiteEvent) {
				defer wg.Done() // This goroutine is finished. ( This line runs when this function returns )

				if err := r.xAddMonitoringEvent(ctx, stream, w.WebsiteID, w.URL); err != nil {
					errCh <- err
				}
			}(w)
		}
		/*
			- Blocks the current goroutine
			- Waits until all goroutines call Done()
		*/
		wg.Wait()
		close(errCh) // Close channel after all goroutines finish

		for err := range errCh {
			return err // If any err exists, fail fast.
		}
	}
	return nil
}

func (r *Redis) XReadGroup(
	ctx context.Context,
	stream string,
	consumerGroup string,
	consumer string,
) ([]domain.StreamResponse, error) {
	args := &goredis.XReadGroupArgs{
		Group:    consumerGroup,
		Consumer: consumer,
		Streams:  []string{stream, ">"},
		Count:    5,
		Block:    5 * time.Second,
	}

	res, err := r.Client.XReadGroup(ctx, args).Result()
	if err != nil {
		if err == goredis.Nil {
			return nil, nil
		}
		return nil, err
	}

	var responses []domain.StreamResponse
	/* Loop over redis stream responses ( XREADGROUP can return multiple responses at once )
	- Each streamRes look like :

	type XStream struct {
		Stream string
		Messages []XMessage
	}

	*/
	for _, streamRes := range res {
		// Holds messages belonging to this stream
		var messages []domain.StreamMessage

		// Loop over messages inside stream

		/* You need to unmarshal all fields from msg.Values, including the optional
		ones, and handle the pointers correctly.
		*/
		for _, msg := range streamRes.Messages {
			/*
				Each msg is
				type XMessage struct {
					ID string
					Values map[string]interface{}
				}
			*/
			payload := domain.StreamPayload{}

			/*
				- msg.Values is map[string]interface{}
				- interface{} : could be anything
				- we type assert it to string

				If websiteId exists and is a string assign it
			*/
			if v, ok := msg.Values["website_id"].(string); ok {
				payload.WebsiteID = v
			}

			/*
				Since URL is an optional field
				- If Redis didn’t send url → payload.URL == nil
				- If it did → pointer to string
			*/
			if v, ok := msg.Values["url"].(string); ok {
				payload.URL = &v
			}

			// PrevStatus (optional, pointer)
			if v, ok := msg.Values["prev_status"].(string); ok {
				status := domain.WebsiteStatus(v)
				payload.PrevStatus = &status
			}

			// CurrentStatus (optional, pointer)
			if v, ok := msg.Values["current_status"].(string); ok {
				status := domain.WebsiteStatus(v)
				payload.CurrentStatus = &status
			}

			// OccurredAt (optional, pointer)
			if v, ok := msg.Values["occurred_at"].(string); ok {
				payload.OccurredAt = &v
			}

			// Converts Redis Message into Domain Type
			messages = append(messages, domain.StreamMessage{
				ID:      msg.ID,
				Message: payload,
			})
		}

		// Attach messages to stream response
		responses = append(responses, domain.StreamResponse{
			Name:    streamRes.Stream,
			Message: messages,
		})
	}
	return responses, nil
}

func (r *Redis) XAck(
	ctx context.Context,
	stream string,
	consumerGroup string,
	messageIDs []string,
	retries int,
) error {
	if len(messageIDs) == 0 {
		return nil
	}
	var err error

	attempts := retries + 1 // always try once
	for i := 0; i < attempts; i++ {
		err = r.Client.XAck(ctx, stream, consumerGroup, messageIDs...).Err()
		if err == nil {
			return nil
		}
		time.Sleep(time.Duration(i+1) * 100 * time.Millisecond)
	}
	return err
}

func (r *Redis) EnsureConsumerGroup(
	ctx context.Context,
	stream string,
	consumerGroup string,
) error {
	err := r.Client.XGroupCreateMkStream(
		ctx,
		stream,
		consumerGroup,
		"0",
	).Err()

	if err != nil {
		if strings.Contains(err.Error(), "BUSYGROUP") {
			return nil
		}
		return err
	}
	return nil
}
