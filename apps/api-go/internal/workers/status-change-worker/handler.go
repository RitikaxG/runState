package statuschangeworker

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
)

type StatusChangeWorker struct {
	redis        *redis.Redis
	notifyStream string
}

func NewStatusChangeWorker(
	notifyStream string,
	redis *redis.Redis,
) *StatusChangeWorker {
	return &StatusChangeWorker{
		redis:        redis,
		notifyStream: notifyStream,
	}
}

func (sw *StatusChangeWorker) Name() string {
	return "status-change-worker"
}

func (sw *StatusChangeWorker) Handle(
	ctx context.Context,
	msg domain.StreamMessage,
) error {
	if msg.Message.PrevStatus == nil ||
		msg.Message.CurrentStatus == nil ||
		msg.Message.OccurredAt == nil {
		return nil
	}

	return sw.redis.XAddNotificationStream(
		ctx,
		sw.notifyStream,
		domain.NotificationMessage{
			WebsiteID:     msg.Message.WebsiteID,
			PrevStatus:    *msg.Message.PrevStatus,
			CurrentStatus: *msg.Message.CurrentStatus,
			OccurredAt:    *msg.Message.OccurredAt,
		},
	)
}
