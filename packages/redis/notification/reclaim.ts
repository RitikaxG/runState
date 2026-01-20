import { client } from "../client";

export const reclaimPendingNotification = async (
    stream : string,
    group : string,
    consumer : string
) => {
    const res = await client.xAutoClaim(
        stream,
        group,
        consumer,
        60000, // minIdleTime
        "0-0",{
            COUNT : 10
        }
    )
    return res.messages;
}
