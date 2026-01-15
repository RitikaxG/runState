import { client } from "./client";
import type { WebsiteStatus } from "@repo/db/client";

export const setCurrentStatus = async (
    websiteId: string, 
    status : WebsiteStatus ) => {
    await client.set(
        `website:${websiteId}:status`,
        status,
        { EX : 60*10
        });
}

export const getPreviousStatusRedis = async (websiteId : string ) : Promise<WebsiteStatus | null>  => {
    const status = await client.get(`website:${websiteId}:status`);
    if(!status) return null;
    return status as WebsiteStatus;
}