package notificationworker

import (
	"context"
	"time"

	"github.com/RitikaxG/runState/apps/api-go/internal/channels"
	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
	"github.com/RitikaxG/runState/apps/api-go/internal/service"
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

	// 2. Idempotency check
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

	// Optional: resolve active incident once
	var incidentID *string
	if nw.incidentRepo != nil {
		activeIncident, err := nw.incidentRepo.GetActiveByWebsiteAndRegion(
			ctx,
			msg.WebsiteID,
			msg.RegionID,
		)
		if err == nil && activeIncident != nil {
			incidentID = &activeIncident.ID
		}
	}

	// 3. Apply rules
	for _, rule := range nw.rules {
		if !ShouldNotify(rule, string(eventType)) {
			continue
		}

		// 4. Throttling
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

		// 5. Resolve channel
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

		// 6. Resolve user email once
		if userEmail == "" {
			userEmail, err = nw.websiteRepo.GetUserEmailByWebsiteID(
				ctx,
				msg.WebsiteID,
			)
			if err != nil {
				return err
			}
		}

		// 7. Send notification
		providerMessageID, sendErr := channel.Send(ctx, channels.NotificationPayload{
			WebsiteID:  msg.WebsiteID,
			EventType:  eventType,
			OccurredAt: msg.OccurredAt,
			Target:     userEmail,
		})

		var providerMessageIDPtr *string
		if providerMessageID != "" {
			providerMessageIDPtr = &providerMessageID
		}

		deliveryStatus := "sent"
		if sendErr != nil {
			deliveryStatus = "failed"
		}

		// 8. Persist notification attempt
		err = nw.notificationLogService.RecordNotificationAttempt(
			ctx,
			service.RecordNotificationAttemptInput{
				WebsiteID:         msg.WebsiteID,
				IncidentID:        incidentID,
				RegionID:          msg.RegionID,
				Channel:           rule.Channel,
				Recipient:         userEmail,
				PrevStatus:        msg.PrevStatus,
				CurrentStatus:     msg.CurrentStatus,
				DeliveryStatus:    deliveryStatus,
				ProviderMessageID: providerMessageIDPtr,
				SentAt:            time.Now().UTC(),
			},
		)
		if err != nil {
			return err
		}

		// 9. Handle send result
		if sendErr != nil {
			LogNotification(map[string]string{
				"websiteId": msg.WebsiteID,
				"eventType": string(eventType),
				"channel":   rule.Channel,
				"status":    "failed",
			})
			continue
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
