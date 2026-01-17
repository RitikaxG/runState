import { client } from "../client";

export const shouldThrottle = async (
    websiteId : string,
    channel : string,
    statusEventType : "DOWN" | "RECOVERY"
) => {
    const res = await client.set(`rate:${websiteId}:${channel}:${statusEventType}`,
        "1",{
        condition : "NX",
        expiration : {
            type : "EX",
            value : 300
        }
    });

    return res !== "OK"
}