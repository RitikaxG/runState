import { WebsiteStatus, prisma } from "@repo/db/client";
import { getPreviousStatusRedis, setCurrentStatus  } from "@repo/redis";

// Define status decision logic
export const getWebsiteStatus = (statusCode : number | null) : WebsiteStatus => {
    if(statusCode === null) return WebsiteStatus.unknown
    else if(statusCode >= 200 && statusCode < 400) return WebsiteStatus.up
    return WebsiteStatus.down
}

export const getPreviousStatus = async (websiteId : string)  => {
    // 1. First Try Redis
    const cachedStatus = await getPreviousStatusRedis(websiteId);
    if(cachedStatus !== null){
        return cachedStatus;
    }
    console.log(cachedStatus);
    // 2. Fallback to DB ( Get details for website with id : websiteId )
    const website = await prisma.website.findUnique({
        where : {
            id : websiteId
        },
        select : {
            currentStatus : true
        }
    })
    console.log(website?.currentStatus);
    if(website?.currentStatus){
        
        await setCurrentStatus(websiteId,website.currentStatus);
        return website.currentStatus;
    }
    return null;
}