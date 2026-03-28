package monitoringworker

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

func (mw *MonitoringWorker) CheckAndUpdateStatus(
	ctx context.Context,
	input domain.MonitoringMessage,
) error {
	// 0. If website was deleted after message was queued, drop this job.
	exists, err := mw.websiteStillExists(ctx, input.WebsiteID)
	if err != nil {
		return err
	}
	if !exists {
		log.Printf("website deleted, skipping monitoring job website=%s", input.WebsiteID)
		return nil
	}

	startTime := time.Now()
	occurredAt := time.Now()

	statusCode := 0

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, input.URL, nil)
	if err != nil {
		return err
	}

	resp, err := mw.httpClient.Do(req)
	if err == nil && resp != nil {
		defer resp.Body.Close()
		statusCode = resp.StatusCode
	}
	log.Printf("statusCode=%v", statusCode)

	responseTimeMs := time.Since(startTime).Milliseconds()
	log.Printf("responseTimeMs=%d", responseTimeMs)

	status := mw.GetWebsiteStatus(statusCode)
	log.Printf("status=%s", status)

	if forced, ok := mw.forceNextStatus[input.WebsiteID]; ok {
		log.Println("Forcing status for testing", forced)
		status = forced
		delete(mw.forceNextStatus, input.WebsiteID)
	}

	prevStatus, err := mw.GetPreviousStatus(ctx, input.WebsiteID)
	if err != nil {
		if errors.Is(err, redis.Nil) || errors.Is(err, sql.ErrNoRows) {
			prevStatus = nil
		} else {
			return err
		}
	}

	// 1. Try to persist the tick.
	// If website was deleted after our existence check, FK on website_id can still happen.
	err = mw.websiteTickRepo.Create(ctx, &domain.WebsiteTicks{
		WebsiteID:      input.WebsiteID,
		RegionID:       input.RegionID,
		Status:         status,
		ResponseTimeMs: responseTimeMs,
	})
	if err != nil {
		if isWebsiteTickWebsiteFKErr(err) {
			log.Printf(
				"website deleted before tick insert, dropping monitoring job website=%s err=%v",
				input.WebsiteID,
				err,
			)
			return nil
		}
		return err
	}

	// 2. First-ever observation.
	if prevStatus == nil {
		updated, err := mw.updateWebsiteStatusIfExists(ctx, input.WebsiteID, status)
		if err != nil {
			return err
		}
		if !updated {
			log.Printf("website deleted before initial status update website=%s", input.WebsiteID)
			return nil
		}
		return nil
	}

	log.Println("Prev Status Transition", *prevStatus)
	log.Println("Current Status", status)

	// 3. Transition detected.
	if *prevStatus != status {
		updated, err := mw.updateWebsiteStatusIfExists(ctx, input.WebsiteID, status)
		if err != nil {
			return err
		}
		if !updated {
			log.Printf("website deleted before transition status update website=%s", input.WebsiteID)
			return nil
		}

		var regionID *string
		if input.RegionID != "" {
			regionID = &input.RegionID
		}

		err = mw.HandleIncidentTransition(
			ctx,
			input.WebsiteID,
			regionID,
			*prevStatus,
			status,
			occurredAt,
		)
		if err != nil {
			// Optional: if your incident flow later returns website-not-found,
			// you can also swallow that here. For now keep other errors visible.
			return err
		}

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

func (mw *MonitoringWorker) websiteStillExists(
	ctx context.Context,
	websiteID string,
) (bool, error) {
	_, err := mw.websiteRepo.GetByID(ctx, websiteID)
	if err != nil {
		if errors.Is(err, domain.ErrWebsiteNotFound) || errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}
	return true, nil
}

func (mw *MonitoringWorker) updateWebsiteStatusIfExists(
	ctx context.Context,
	websiteID string,
	status domain.WebsiteStatus,
) (bool, error) {
	err := mw.websiteRepo.UpdateWebsiteStatus(ctx, websiteID, status)
	if err != nil {
		if errors.Is(err, domain.ErrWebsiteNotFound) || errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}
		return false, err
	}

	_ = mw.redis.SetCurrentStatus(ctx, websiteID, status)
	return true, nil
}

func isWebsiteTickWebsiteFKErr(err error) bool {
	var pqErr *pq.Error
	if !errors.As(err, &pqErr) {
		return false
	}

	return string(pqErr.Code) == "23503" &&
		pqErr.Constraint == "website_ticks_website_id_fkey"
}
