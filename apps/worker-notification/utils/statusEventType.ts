// Detect the event type

import { WebsiteStatus } from "@repo/db/client";

export type StatusEventType = "DOWN" | "RECOVERY" | null;

export const getStatusEventType = (
    prevStatus : WebsiteStatus,
    currentStatus : WebsiteStatus
) : StatusEventType => {
    
    if(prevStatus === WebsiteStatus.up && currentStatus === WebsiteStatus.down){
        return "DOWN";
    }

    if(prevStatus === WebsiteStatus.down && currentStatus === WebsiteStatus.up){
        return "RECOVERY";
    }
    
    return null;
}