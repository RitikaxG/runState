import type { NotificationMessage } from "@repo/redis";
import { incrementRetry, isAlreadySent, markAsSentOnce, pushToDlq, shouldThrottle } from "@repo/redis";
import { env } from "./env";
import { channels } from "./channels";
import { getStatusEventType } from "./utils/statusEventType";
import { DEFAULT_RULES } from "./rules";
import { websiteService } from "@repo/shared-repo";
import { logNotification } from "./logger";

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
        console.log(`Website Status`,statusEventType);
        if(statusEventType === null){
            logNotification({
                websiteId : msg.websiteId,
                status : "NO_OP"
            })
            return "NO_OP";
        }

         // 2. Check mark notification sent ( per message ) / Idempoteny Check
        const alreadySent = await isAlreadySent(
            msg.websiteId,
            statusEventType
        )

        if(alreadySent){
            logNotification({
                websiteId : msg.websiteId,
                eventType : statusEventType,
                status : "ALREADY_SENT"
            })
            return "ALREADY_SENT";
        }
        
        let sentAtLeastOnce = false;
        let userEmail : string | null = null;

        // 3. Apply rules
        for(const rule of DEFAULT_RULES){
            if(!rule.enabled) continue;
            if( rule.notifyOn !== "BOTH" && 
                rule.notifyOn !== statusEventType){
                continue;
            }

           // 4. Rate Limit per notification per channel
           const throttled = await shouldThrottle(
                msg.websiteId,
                rule.channel,
                statusEventType
           )

           if(throttled){
            logNotification({
                websiteId : msg.websiteId,
                channel : rule.channel,
                eventType : statusEventType,
                status : "THROTTLED"
            })
            continue;
           }


            // 5. Send notification

            const channel = channels[rule.channel];
            console.log(`Using channel ${channel} to send notification`);
            if(!channel){
                console.warn(`Channel not registered ${rule.channel}`);
                continue;
            }

            if(!userEmail){
                userEmail = await websiteService.resolveUserEmailForWebsite(
                    msg.websiteId
                );
                console.log(`User email to whom notification will be sent : `,userEmail);
            }
            

            await channels[rule.channel]!.send({
                websiteId : msg.websiteId,
                eventType : statusEventType,
                occurredAt : msg.occurredAt,
                email : userEmail
            })
            sentAtLeastOnce = true;

            logNotification({
                websiteId : msg.websiteId,
                eventType : statusEventType,
                channel : rule.channel,
                status : "SENT"
            })
        }

        if(sentAtLeastOnce){
            await markAsSentOnce(
                msg.websiteId,
                statusEventType
            )
            return "SENT";
        }

       
        return "NO_OP";

    }catch(err){
        
        // 6. Retry Logic
        const retries = await incrementRetry(messageId);
        logNotification({
            messageId,
            websiteId : msg.websiteId,
            status : "FAILED",
            retries : retries.toString(),
            reason : (err as Error).message
        })
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
            logNotification({
                messageId,
                websiteId : msg.websiteId,
                status : "DLQ",
                retries : retries.toString()
            })
            return "DLQ";
        }

        // exponential backoff
        await new Promise(res => setTimeout(res, retries * 1000));
        throw err;
    }
}