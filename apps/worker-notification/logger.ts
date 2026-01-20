
export type NotificationStatus = 
"SENT" |
"ALREADY_SENT" |
"NO_OP" |
"DLQ" |
"FAILED" |
"THROTTLED" |
"SKIPPED";

export const logNotification = (input : {
    messageId? : string,
    websiteId : string,
    channel? : string,
    eventType? : string,
    retries? : string,
    status : NotificationStatus,
    reason? : string
})=> {
    console.log(JSON.stringify({
        service : "worker-notification",
        timeStamp : new Date().toISOString(),
        ...input
    }))
}

