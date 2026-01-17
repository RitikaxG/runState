// Dead Letter Queue
import type { WebsiteStatus } from "@repo/db/client";
import { client } from "../client";

export type DLQ = {
    messageId : string,
    websiteId : string,
    prevStatus : WebsiteStatus,
    currentStatus : WebsiteStatus,
    occurredAt : string,
    retries : string,
    reason : string
}

export const pushToDlq = async ( 
    stream : string, 
    msg : DLQ
) => {
    await client.xAdd(`${stream}:dlq`,"*",msg);
}