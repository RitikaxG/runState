package notificationworker

import (
	"context"
	"fmt"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/channels"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/redis"
	"github.com/RitikaxG/runState/apps/api-go/internal/repository"
)

type NotificationWorker struct {
	redis        *redis.Redis
	notifyStream string
	channels     channels.ChannelRegistry
	rules        []NotificationRule
	maxRetries   int
	websiteRepo  repository.WebsiteRepository

	stream      string
	group       string
	consumer    string
	reclaimIdle time.Duration
}

func NewNotificationWorker(
	redis *redis.Redis,
	notifyStream string,
	channels channels.ChannelRegistry,
	rules []NotificationRule,
	websiteRepo repository.WebsiteRepository,

	group string,
	consumer string,

) *NotificationWorker {
	return &NotificationWorker{
		redis:        redis,
		notifyStream: notifyStream,
		channels:     channels,
		rules:        rules,
		maxRetries:   5,
		websiteRepo:  websiteRepo,

		stream:      notifyStream,
		group:       group,
		consumer:    consumer,
		reclaimIdle: 60 * time.Second,
	}
}

func (nw *NotificationWorker) Name() string {
	return `notification-worker`
}

func (nw *NotificationWorker) Handle(
	ctx context.Context,
	msg domain.StreamMessage,
) error {
	input := domain.NotificationMessage{
		WebsiteID:     msg.Message.WebsiteID,
		PrevStatus:    *msg.Message.PrevStatus,
		CurrentStatus: *msg.Message.CurrentStatus,
		OccurredAt:    *msg.Message.OccurredAt,
	}
	err := nw.SendNotification(ctx, input)
	if err == nil {
		return nil
	}

	retries, _ := nw.redis.IncrementRetry(ctx, msg.ID)
	LogNotification(map[string]string{
		"messageId": msg.ID,
		"websiteId": msg.Message.WebsiteID,
		"status":    string(NotifFailed),
		"retries":   fmt.Sprintf("%d", retries),
	})

	if retries >= int64(nw.maxRetries) {
		LogNotification(map[string]string{
			"messageId": msg.ID,
			"status":    string(NotifDLQ),
		})
		return nil
	}
	time.Sleep(time.Duration(retries) * time.Second)
	return err
}

func (nw *NotificationWorker) Reclaim(ctx context.Context) error {
	messages, err := nw.redis.ReclaimPendingNotification(
		ctx,
		nw.stream,
		nw.group,
		nw.consumer,
	)
	if err != nil {
		return err
	}

	for _, msg := range messages {
		LogNotification(map[string]string{
			"messageId": msg.ID,
			"status":    "reclaimed",
		})

		if err := nw.handleReclaimedMessage(ctx, msg); err != nil {
			LogNotification(map[string]string{
				"messageId": msg.ID,
				"status":    "reclaim_failed",
				"reason":    err.Error(),
			})
		}
	}
	return nil
}
