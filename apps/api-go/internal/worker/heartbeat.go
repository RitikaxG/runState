package worker

import (
	"context"
	"log"
	"time"
)

/*
StartHeartBeat starts a background goroutine that logs a heartbeat message at a fixed interval,
and returns a function you can call to stop the ticker.
*/
func StartHeartBeat(
	ctx context.Context,
	service string,
	interval time.Duration,
	meta map[string]string,
) func() {

	ticker := time.NewTicker(interval)

	go func() {
		for {
			select {
			case <-ticker.C:
				log.Println("heartbeat", service, meta)

			case <-ctx.Done():
				return
			}
		}
	}()

	// Allows the caller to stop the ticker manually
	return func() {
		ticker.Stop()
	}
}
