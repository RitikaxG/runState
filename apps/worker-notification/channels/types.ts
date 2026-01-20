// Channel Abstraction ( HOW to notify )

// Any class/object that implements this interface must follow its rules
export interface NotificationChannel {
    send(payload : NotificationPayload): Promise<void> // this method is async, it doesnt return any value.
}

export type NotificationPayload = {
    websiteId : string,
    eventType : "DOWN" | "RECOVERY",
    occurredAt : string,
    email : string
}