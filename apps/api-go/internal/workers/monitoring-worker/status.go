package monitoringworker

import (
	"context"
	"database/sql"
	"log"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

func (mw *MonitoringWorker) GetWebsiteStatus(statusCode int) domain.WebsiteStatus {

	if statusCode >= 200 && statusCode < 400 {
		return domain.WebsiteUp
	}
	return domain.WebsiteDown
}

func (mw *MonitoringWorker) GetPreviousStatus(
	ctx context.Context,
	websiteId string,
) (*domain.WebsiteStatus, error) {

	// // 1. Try Redis First
	// cachedStatus, err := mw.redis.GetPreviousStatusRedis(ctx, websiteId)
	// if err != nil {
	// 	return nil, err
	// }

	// // 2. If redis has the status , return immediately
	// if cachedStatus != nil {
	// 	return cachedStatus, nil
	// }

	// 3. Redis miss -> Fallback to db
	website, err := mw.websiteRepo.GetByID(ctx, websiteId)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // website gone; ignore
		}
		return nil, err
	}

	if website.CurrentStatus == nil {
		log.Println("Previous Status: <nil>")
	} else {
		log.Println("Previous Status:", *website.CurrentStatus)
	}

	// If DB has status -> warm redis cache
	if website.CurrentStatus != nil {
		_ = mw.redis.SetCurrentStatus(ctx, websiteId, *website.CurrentStatus)
		return website.CurrentStatus, nil
	}

	return nil, nil
}
