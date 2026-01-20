import { client } from "./client";
import { WebsiteStatus } from "@repo/db/client";

const STATUS_CHANGE_STREAM = process.env.STATUS_CHANGE_STREAM as string;
if(!STATUS_CHANGE_STREAM){
    throw new Error("STATUS_CHANGE_STREAM not found");
}

export const xAddStatusChange = async ( 
    websiteId : string, 
    prevStatus : WebsiteStatus, 
    currentStatus : WebsiteStatus ) => {
    const res = await client.xAdd(
        STATUS_CHANGE_STREAM,"*",{
            websiteId,
            prevStatus,
            currentStatus,
            occurredAt : new Date().toISOString()
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




