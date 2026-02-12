package channels

import (
	"context"
	"fmt"

	"github.com/mailgun/mailgun-go/v5"
)

type EmailChannel struct {
	mg     mailgun.Mailgun
	domain string
	sender string
}

func NewEmailChannel(
	apiKey string,
	domain string,
	sender string,
) *EmailChannel {
	mg := mailgun.NewMailgun(apiKey)

	return &EmailChannel{
		mg:     mg,
		domain: domain,
		sender: sender,
	}
}

func (ec *EmailChannel) Send(
	ctx context.Context,
	payload NotificationPayload,
) (string, error) {
	subject := fmt.Sprintf("Website Alert %s", payload.EventType)

	body := fmt.Sprintf(
		"Your website %s is %s at %s",
		payload.WebsiteID,
		payload.EventType,
		payload.OccurredAt,
	)

	msg := mailgun.NewMessage(
		ec.sender,
		subject,
		body,
		payload.Target, // email address
	)

	resp, err := ec.mg.Send(ctx, msg)
	if err != nil {
		return "", err
	}
	return resp.ID, nil
}
