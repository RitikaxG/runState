package channels

import (
	"context"

	"github.com/RitikaxG/runState/apps/api-go/internal/domain"
)

type NotificationPayload struct {
	WebsiteID  string
	EventType  domain.EventType
	OccurredAt string
	/*
		Destination :
		email - email address
		webhook - URL
		SMS - phone number
		Slack webhook URL
	*/
	Target string
}

type NotificationChannel interface {
	Send(ctx context.Context, payload NotificationPayload) (string, error)
}
