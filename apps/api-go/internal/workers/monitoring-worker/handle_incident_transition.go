package monitoringworker

import (
	"context"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

func (mw *MonitoringWorker) HandleIncidentTransition(
	ctx context.Context,
	websiteID string,
	regionID *string,
	prevStatus domain.WebsiteStatus,
	currentStatus domain.WebsiteStatus,
	occurredAt time.Time,
) error {
	if prevStatus == currentStatus {
		return nil
	}

	// open incident
	if (prevStatus == domain.WebsiteUp || prevStatus == domain.WebsiteUnknown) &&
		currentStatus == domain.WebsiteDown {
		return mw.incidentService.OpenIncidentIfNeeded(
			ctx,
			websiteID,
			regionID,
			currentStatus,
			occurredAt,
		)
	}

	// resolve incident
	if prevStatus == domain.WebsiteDown &&
		currentStatus == domain.WebsiteUp {
		return mw.incidentService.ResolveIncidentIfNeeded(
			ctx,
			websiteID,
			regionID,
			currentStatus,
			occurredAt,
		)
	}

	return nil
}
