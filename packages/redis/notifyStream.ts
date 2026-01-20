import { client } from "./client";
import type { NotificationMessage } from "./types";

const NOTIFICATION_STREAM = process.env.NOTIFICATION_STREAM as string;
if(!NOTIFICATION_STREAM){
    throw new Error("STATUS_CHANGE_STREAM not found");
}

export const xAddNotifyStream = async ( msg : NotificationMessage) => {
    const res = await client.xAdd(
        NOTIFICATION_STREAM,"*",{
            websiteId : msg.websiteId,
            regionId : msg.regionId ?? "",
            prevStatus : msg.prevStatus,
            currentStatus : msg.currentStatus,
            occurredAt : msg.occurredAt
        },{
            TRIM : {
                strategy : "MAXLEN",
                strategyModifier : "~",
                threshold : 100000
            }
        }
    )
    return res;
}
