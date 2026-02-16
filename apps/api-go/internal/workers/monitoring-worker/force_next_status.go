package monitoringworker

import "github.com/RitikaxG/runState/apps/api-go/internal/domain"

func (mw *MonitoringWorker) ForceNextStatus(
	websiteId string,
	status domain.WebsiteStatus,
) {
	// Forces the next status result for a given website.
	mw.forceNextStatus[websiteId] = status
}
