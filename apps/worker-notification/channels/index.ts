import type { NotificationRule } from "../rules";
import { EmailChannel } from "./email";
import type { NotificationChannel } from "./types";
import { WebhookChannel } from "./webhook";

export const channels : Record<NotificationRule["channel"], NotificationChannel> = {
    email : new EmailChannel(),
    webhook : new WebhookChannel()
}