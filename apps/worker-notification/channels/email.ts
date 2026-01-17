import type { NotificationChannel, NotificationPayload } from "./types";

export class EmailChannel implements NotificationChannel {
    async send(payload: NotificationPayload): Promise<void> {
        console.log(`Website ${payload.websiteId} is ${payload.eventType} at ${payload.occurredAt}`);
    }
}