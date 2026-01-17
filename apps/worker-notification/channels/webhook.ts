import type { NotificationChannel, NotificationPayload } from "./types";

export class WebhookChannel implements NotificationChannel {
    async send(payload: NotificationPayload): Promise<void> {
        console.log(`Webhook ${payload.websiteId} is ${payload.eventType} at ${payload.occurredAt}`)
    }
}