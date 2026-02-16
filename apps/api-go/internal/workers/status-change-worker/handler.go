package statuschangeworker

import (
	"context"
	"log"

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

	log.Printf("[status-change-worker] received message: %+v", msg.Message)

	notification := domain.NotificationMessage{
		WebsiteID:     msg.Message.WebsiteID,
		PrevStatus:    *msg.Message.PrevStatus,
		CurrentStatus: *msg.Message.CurrentStatus,
		OccurredAt:    *msg.Message.OccurredAt,
	}
	log.Println(notification)

	err := sw.redis.XAddNotificationStream(
		ctx,
		sw.notifyStream,
		notification,
	)
	if err != nil {
		log.Printf("[status-change-worker] failed to add notification (website_id=%s, prev=%s, curr=%s): %v",
			notification.WebsiteID,
			notification.PrevStatus,
			notification.CurrentStatus,
			err)
		return err
	}
	log.Printf("[status-change-worker] notification added (website_id=%s, %s → %s)",
		notification.WebsiteID,
		notification.PrevStatus,
		notification.CurrentStatus,
	)
	return nil
}
