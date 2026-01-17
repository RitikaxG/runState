import { WebsiteStatus } from "@repo/db/client"

export type StreamMessage = {
    id : string, // redis msg id
    message : {
        websiteId : string,
        url? : string,
        prevStatus? : WebsiteStatus,
        currentStatus? : WebsiteStatus,
        occurredAt? : string
    }
}

export type StreamResponse = {
    name : string,
    messages : StreamMessage[]
}

export interface WebsiteEvent {
    websiteId : string,
    url : string
}

export type NotificationMessage = {
    websiteId : string,
    regionId? : string,
    prevStatus: WebsiteStatus,
    currentStatus : WebsiteStatus,
    occurredAt : string
}