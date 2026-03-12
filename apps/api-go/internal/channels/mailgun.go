package channels

import (
	"context"
	"fmt"

	"github.com/mailgun/mailgun-go/v5"
)

type MailgunChannel struct {
	mg     mailgun.Mailgun
	domain string
	from   string
}

func NewMailgunChannel(
	apiKey string,
	domain string,
	from string,
) *MailgunChannel {
mg:
	return &MailgunChannel{
		mg:     mg,
		domain: domain,
		from:   from,
	}

}

func (ec *EmailChannel) Send(
	ctx context.Context,
	payload NotificationPayload,
) (string, error) {
	fmt.Println("Website %s is %s at %s",
		payload.WebsiteID,
		payload.EventType,
		payload.OccurredAt,
	)
	return ec.sendViaMailgun(ctx, payload)
}

func (ec *EmailChannel) sendViaMailgun(
	ctx context.Context,
	payload NotificationPayload,
) (string, error) {
	mg := mailgun.NewMailgun(ec.Domain, ec.MailgunAPIKey)
	m := mg.NewMessage
}

// export class EmailChannel implements NotificationChannel {
//     async send(payload: NotificationPayload): Promise<void> {
//         console.log(`Website ${payload.websiteId} is ${payload.eventType} at ${payload.occurredAt}`);
//         await sendEmailViaMailgun(payload);
//     }
// }

// async function sendEmailViaMailgun( payload : NotificationPayload ) {
//   const mailgun = new Mailgun(FormData);
//   const mg = mailgun.client({
//     username: "api",
//     key: MAILGUN_API_KEY,
//   });
//   try {
//     const data = await mg.messages.create("sandboxf0ae1aa71b334d07abbef5327293e589.mailgun.org", {
//       from: "Mailgun Sandbox <postmaster@sandboxf0ae1aa71b334d07abbef5327293e589.mailgun.org>",
//       to: [payload.email],
//       subject: `Website Alert ${payload.eventType}`,
//       text: `Your website ${payload.websiteId} is ${payload.eventType} at ${payload.occurredAt}`,
//     });

//     console.log("Email sent",data); // logs response data
//   } catch (error) {
//     console.error(`Mailgun failed`,error); //logs any error
//   }
// }
