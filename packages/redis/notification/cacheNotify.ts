// notification:sent:<websiteId>:<statusEventType>

import { client } from "../client";

export const markAsSentOnce = async ( 
    websiteId : string,
    statusEventType : "RECOVERY" | "DOWN" 
) => {
    const res = await client.set(`notification:sent:${websiteId}:${statusEventType}`,
        "1",{
        condition : "NX",
        expiration : {
            type : "EX",
            value : 60*60*24*7
        }
    });

    return res === "OK";
}

export const isAlreadySent = async (
    websiteId : string,
    statusEventType : "RECOVERY" | "DOWN"
) => {
    const res = await client.get(`notification:sent:${websiteId}:${statusEventType}`);
    return res === "1";
}