package monitoringworker

import (
	"context"
	"net/http"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
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
	if err == nil {
		/*
			Execute the HTTP Response
			- Send request over the network, ait for response or error
		*/
		resp, err := mw.httpClient.Do(req)
		if err == nil {
			// Ensure response body is closed
			defer resp.Body.Close()

			// Extract HTTP status code
			code := resp.StatusCode
			statusCode = &code
		}
	}

	responseTimeMs := time.Since(startTime).Milliseconds()

	// Convert HTTP result -> domain status
	status := mw.GetWebsiteStatus(statusCode)

	// Fetch Previous status
	prevStatus, err := mw.GetPreviousStatus(ctx, input.WebsiteID)
	if err != nil {
		return err
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
	if *prevStatus != status {
		err = mw.websiteRepo.UpdateWebsiteStatus(ctx, input.WebsiteID, status)
		if err != nil {
			return err
		}

		_ = mw.redis.SetCurrentStatus(ctx, input.WebsiteID, status)

		_ = mw.redis.XAddStatusChangeStream(
			ctx,
			mw.statusChangeStream,
			input.WebsiteID,
			*prevStatus,
			status,
		)
	}
	return nil
}
