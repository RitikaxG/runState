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

// Worker Identity
func (nw *NotificationWorker) Name() string {
	return `notification-worker`
}

func (nw *NotificationWorker) Handle(
	ctx context.Context,
	msg domain.StreamMessage,
) error {
	// Convert StreamMessage to NotificationMessage
	input := domain.NotificationMessage{
		WebsiteID:     msg.Message.WebsiteID,
		PrevStatus:    *msg.Message.PrevStatus,
		CurrentStatus: *msg.Message.CurrentStatus,
		OccurredAt:    *msg.Message.OccurredAt,
	}

	/*
		If successful:
			Worker engine will ACK
			Message is done
	*/
	sendErr := nw.SendNotification(ctx, input)
	if sendErr == nil {
		return nil
	}

	// Retry tracking on failure
	retries, _ := nw.redis.IncrementRetry(ctx, msg.ID)
	// Log Failure
	LogNotification(map[string]string{
		"messageId": msg.ID,
		"websiteId": msg.Message.WebsiteID,
		"status":    string(NotifFailed),
		"retries":   fmt.Sprintf("%d", retries),
	})

	t, parseErr := time.Parse(time.RFC3339, *msg.Message.OccurredAt)
	if parseErr != nil {
		return parseErr
	}

	occurredAt := t.UTC()

	// DLQ Decision
	if retries >= int64(nw.maxRetries) {

		dlqMsg := domain.DLQMessage{
			MessageID:     msg.ID,
			WebsiteID:     msg.Message.WebsiteID,
			PrevStatus:    *msg.Message.PrevStatus,
			CurrentStatus: *msg.Message.CurrentStatus,
			OccurredAt:    occurredAt,
			Retries:       int(retries),
			Reason:        sendErr.Error(),
		}

		// Push to DLQ
		if dlqErr := nw.redis.PushToDLQ(
			ctx,
			nw.stream,
			dlqMsg,
		); dlqErr != nil {
			LogNotification(map[string]string{
				"messageId": msg.ID,
				"status":    "DLQ_PUSH_FAILED",
				"reason":    dlqErr.Error(),
			})
		}

		LogNotification(map[string]string{
			"messageId": msg.ID,
			"status":    string(NotifDLQ),
		})

		return nil
	}

	// Backoff before retrying
	time.Sleep(time.Duration(retries) * time.Second)
	return sendErr
}

func (nw *NotificationWorker) Reclaim(ctx context.Context) error {
	// Ask redis for recliamed msgs
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

		// Process reclaimed message
		if err := nw.handleReclaimedMessage(ctx, msg); err != nil {
			// Handle reclaim failures
			LogNotification(map[string]string{
				"messageId": msg.ID,
				"status":    "reclaim_failed",
				"reason":    err.Error(),
			})
		}
	}
	return nil
}
