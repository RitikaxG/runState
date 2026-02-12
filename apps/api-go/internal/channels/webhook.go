package channels

import (
	"context"
	"log"
)

type WebhookChannel struct {
}

func NewWebhookChannel() *WebhookChannel {
	return &WebhookChannel{}
}

func (wc *WebhookChannel) Send(
	ctx context.Context,
	payload NotificationPayload,
) (string, error) {
	log.Printf(
		"Website %s is %s at %s",
		payload.WebsiteID,
		payload.EventType,
		payload.OccurredAt,
	)

	return "ok", nil
}
