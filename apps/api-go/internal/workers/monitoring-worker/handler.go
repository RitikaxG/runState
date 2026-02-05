package monitoringworker

import (
	"context"
	"net/http"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

type MonitoringWorker struct {
	regionID           string
	statusChangeStream string
	/*
		WebsiteRepository & WebsiteTickRepository are interfaces.
		Interfaces are passed by value.

		Therefore, we do not pass pointer to interface
		*repository.WebsiteRepository  ❌
	*/
	websiteRepo     repository.WebsiteRepository
	websiteTickRepo repository.WebsiteTicksRepository

	// Concrete implementation are passed by pointer
	redis      *redis.Redis
	httpClient *http.Client
}

func NewMonitoringWorker(
	regionID string,
	statusChangeStream string,
	websiteRepo repository.WebsiteRepository,
	websiteTickRepo repository.WebsiteTicksRepository,
	redis *redis.Redis,
	httpClient *http.Client,
) *MonitoringWorker {
	return &MonitoringWorker{
		regionID:           regionID,
		statusChangeStream: statusChangeStream,
		websiteRepo:        websiteRepo,
		websiteTickRepo:    websiteTickRepo,
		redis:              redis,
		httpClient:         httpClient,
	}
}

// Define methods that are required by worker.Handler interface

/*
- Name() is required by worker.Handler interface.
- Its the worker's identity
*/
func (h *MonitoringWorker) Name() string {
	return "monitoring-worker"
}

/*
- Handle() process exactly one stream message
*/
func (mw *MonitoringWorker) Handle(
	ctx context.Context,
	msg domain.StreamMessage,
) error {
	/* Convert stream message to domain input
	- domain.StreamMessage is Redis specific ( Transport layer )
	- domain.MonitoringMessage is what MonitoringWorker's Handle() actually needs ( transport layer )
	*/
	input := domain.MonitoringMessage{
		WebsiteID: msg.Message.WebsiteID,
		URL:       *msg.Message.URL,
		RegionID:  mw.regionID,
	}

	return mw.CheckAndUpdateStatus(ctx, input)
}
