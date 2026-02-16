package monitoringworker

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/redis/go-redis/v9"
)

func (mw *MonitoringWorker) CheckAndUpdateStatus(
	ctx context.Context,
	input domain.MonitoringMessage,
) error {
	startTime := time.Now()

	var statusCode *int

	/*
		- Create an http Request bound to a context.
			* Creates HTTP GET Request to input.URL, attaches ctx to request.
	*/
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, input.URL, nil)
	if err != nil {
		return err
	}

	/*
		Execute the HTTP Response
		- Send request over the network, ait for response or error
	*/
	resp, err := mw.httpClient.Do(req)
	if err != nil {
		code := 0
		statusCode = &code
	} else {
		// Ensure response body is closed
		defer resp.Body.Close()

		// Extract HTTP status code
		code := resp.StatusCode
		statusCode = &code
	}
	log.Printf("statusCode=%v", statusCode)

	responseTimeMs := time.Since(startTime).Milliseconds()
	log.Printf("responseTimeMs=%d", responseTimeMs)

	// Convert HTTP result -> domain status
	status := mw.GetWebsiteStatus(statusCode)
	log.Printf("status=%s", status)

	// DEV / TEST OVERRIDE
	if forced, ok := mw.forceNextStatus[input.WebsiteID]; ok {
		log.Println("Forcing status for testing", forced)
		status = forced
		delete(mw.forceNextStatus, input.WebsiteID) // one-time
	}

	// Fetch Previous status
	prevStatus, err := mw.GetPreviousStatus(ctx, input.WebsiteID)
	if err != nil {
		/* GetPreviousStatus must treat "not found" as not an error

		- Else if prevStatus is not found, worker-monitoring throws an err
		- Engine will not ACK the message, for first ever tick of website,
		since prevStatus is not found in both Redis and DB, its a cache miss and DB miss, which should be treated as "not found" and not an error.
		*/
		if errors.Is(err, redis.Nil) {
			prevStatus = nil
		} else {
			return err
		}
	}

	// Write monitoring tick ( append-only )
	err = mw.websiteTickRepo.Create(ctx, &domain.WebsiteTicks{
		WebsiteID:      input.WebsiteID,
		RegionID:       input.RegionID,
		Status:         status,
		ResponseTimeMs: responseTimeMs,
	})
	if err != nil {
		return err
	}

	// First ever observation
	if prevStatus == nil {
		err = mw.websiteRepo.UpdateWebsiteStatus(
			ctx,
			input.WebsiteID,
			status,
		)
		if err != nil {
			return err
		}

		_ = mw.redis.SetCurrentStatus(ctx, input.WebsiteID, status)
		return nil
	}

	// Status transition detected
	log.Println("Prev Status Transition", *prevStatus)
	log.Println("Current Status", status)
	if *prevStatus != status {
		err = mw.websiteRepo.UpdateWebsiteStatus(ctx, input.WebsiteID, status)
		if err != nil {
			return err
		}

		_ = mw.redis.SetCurrentStatus(ctx, input.WebsiteID, status)

		if err := mw.redis.XAddStatusChangeStream(
			ctx,
			mw.statusChangeStream,
			input.WebsiteID,
			*prevStatus,
			status,
		); err != nil {
			log.Println("Failed to push status change event", err)
		}
	}
	return nil
}
