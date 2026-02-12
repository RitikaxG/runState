package notificationworker

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/channels"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

func (nw *NotificationWorker) SendNotification(
	ctx context.Context,
	msg domain.NotificationMessage,
) error {
	// 1. Determine event type
	eventTypePtr := domain.GetEventType(msg.PrevStatus, msg.CurrentStatus)
	if eventTypePtr == nil {
		LogNotification(map[string]string{
			"websiteId": msg.WebsiteID,
			"status":    string(NotifNoOp),
		})
		return nil
	}

	eventType := *eventTypePtr

	// 2. Idempotency Check
	ok, err := nw.redis.MarkAsSentOnce(ctx, msg.WebsiteID, eventType)
	if err != nil {
		return err
	}

	if !ok {
		LogNotification(map[string]string{
			"websiteId": msg.WebsiteID,
			"eventType": string(eventType),
			"status":    string(NotifAlreadySent),
		})
		return nil
	}

	var (
		sentAtLeastOnce bool
		userEmail       string
	)

	// Apply Rules
	for _, rule := range nw.rules {
		if !ShouldNotify(rule, string(eventType)) {
			continue
		}

		// Throttling
		throttled, err := nw.redis.ShouldThrottle(
			ctx,
			msg.WebsiteID,
			eventType,
			rule.Channel,
		)
		if err != nil {
			return err
		}

		if throttled {
			LogNotification(map[string]string{
				"websiteId": msg.WebsiteID,
				"channel":   rule.Channel,
				"eventType": string(eventType),
				"status":    string(NotifThrottled),
			})
			continue
		}

		// Resolve Channel
		channelType := domain.NotificationChannelType(rule.Channel)
		channel, ok := nw.channels[channelType]
		if !ok {
			LogNotification(map[string]string{
				"websiteId": msg.WebsiteID,
				"eventType": string(eventType),
				"status":    string(NotifSkipped),
				"reason":    "channel_not_registered",
			})
			continue
		}

		// Resolve user email once
		if userEmail == "" {
			userEmail, err = nw.websiteRepo.GetUserEmailByWebsiteID(
				ctx,
				msg.WebsiteID,
			)
			if err != nil {
				return err
			}
		}

		// Send Notification
		_, err = channel.Send(ctx, channels.NotificationPayload{
			WebsiteID:  msg.WebsiteID,
			EventType:  eventType,
			OccurredAt: msg.OccurredAt,
			Target:     userEmail,
		})

		if err != nil {
			return err
		}

		sentAtLeastOnce = true

		LogNotification(map[string]string{
			"websiteId": msg.WebsiteID,
			"eventType": string(eventType),
			"channel":   rule.Channel,
			"status":    string(NotifSent),
		})

	}

	if !sentAtLeastOnce {
		LogNotification(map[string]string{
			"websiteId": msg.WebsiteID,
			"eventType": string(eventType),
			"status":    string(NotifNoOp),
		})
	}
	return nil

}
