import type { NotificationMessage } from "@repo/redis";
import { incrementRetry, markAsSentOnce, pushToDlq, shouldThrottle } from "@repo/redis";
import { env } from "./env";
import { channels } from "./channels";
import { getStatusEventType } from "./utils/statusEventType";
import { DEFAULT_RULES } from "./rules";

const NOTIFICATION_STREAM = env.NOTIFICATION_STREAM;
const MAX_TRIES = 5;

export const sendNotification = async (
    messageId : string,
    msg : NotificationMessage
): Promise<"NO_OP" | "ALREADY_SENT" | "SENT" | "DLQ"> => {

    try{
        
        // 1. Determine status transition
        const statusEventType = getStatusEventType(
            msg.prevStatus,
            msg.currentStatus
        )

        if(statusEventType === null){
            return "NO_OP";
        }

        // 2. Check if notification already sent ( pre message )
        const canSendNotification = await markAsSentOnce(
            msg.websiteId,
            statusEventType
        )

        if(!canSendNotification){
            return "ALREADY_SENT";
        }

        let sent = false;

        // 3. Apply rules
        for(const rule of DEFAULT_RULES){
            if(!rule.enabled) continue;
            if( rule.notifyOn !== "BOTH" && 
                rule.notifyOn !== statusEventType){
                continue;
            }

           // 4. Rate Limit per notification per channel
           const limited = await shouldThrottle(
                msg.websiteId,
                rule.channel,
                statusEventType
           )

           if(limited){
            continue;
           }


            // 5. Send notification

            const channel = channels[rule.channel];
            if(!channel){
                console.warn(`Channel not registered ${rule.channel}`);
                continue;
            }
            await channels[rule.channel]!.send({
                websiteId : msg.websiteId,
                eventType : statusEventType,
                occurredAt : msg.occurredAt
            })
            sent = true;
        }

        return sent ? "SENT" : "NO_OP";

    }catch(err){

        // 6. Retry Logic
        const retries = await incrementRetry(messageId);

        if(retries >= MAX_TRIES){
            await pushToDlq(NOTIFICATION_STREAM,{
                messageId,
                websiteId : msg.websiteId,
                prevStatus : msg.prevStatus,
                currentStatus : msg.currentStatus,
                occurredAt : msg.occurredAt,
                retries : retries.toString(),
                reason: "Max retries exceeded"
            });
            return "DLQ";
        }

        // exponential backoff
        await new Promise(res => setTimeout(res, retries * 1000));
        throw err;
    }
}