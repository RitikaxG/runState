import type { WebsiteCheckInput } from "./types";
import { setCurrentStatus, xAddStatusChange } from "@repo/redis";
import { getWebsiteStatus, getPreviousStatus } from "./status";
import axios from "axios";
import { prisma } from "@repo/db/client";

//  Write function to check & update website status (one unit of work )
export const checkAndUpdateStatus = async (input : WebsiteCheckInput ) => {
    const startTime = Date.now();

    let statusCode : number | null;

    try{
        // 1. Update Website Status
        const response = await axios.get(input.url,{
            timeout : 5*1000, // 5 sec
            validateStatus : () => true
        })

        statusCode = response.status;
        
    }catch(err){
        statusCode = null
    }

    // 2. Update Response Time
    const responseTimeMs = Date.now() - startTime;
    const status = getWebsiteStatus(statusCode);

    // 3. Fetch Previous Status of website
    const previousStatus = await getPreviousStatus(input.websiteId);
    console.log(previousStatus);
    // 4. Store to WebsiteTicks
    await prisma.websiteTicks.create({
        data : {
            status,
            responseTimeMs,
            websiteId : input.websiteId,
            regionId : input.regionId
        }
    })

    // 5. when there's no previous status for a website create new
    if(!previousStatus || previousStatus === null){
        await prisma.website.update({
            where : {
                id : input.websiteId
            },
            data : {
                currentStatus : status
            }
        })

        await setCurrentStatus(input.websiteId,status);
        return;
    }

    // 6. if there's a change in website status update DB
    if(previousStatus != status){
        await prisma.website.update({
            where : {
                id : input.websiteId
            },
            data : {
                currentStatus : status
            }
        })

        await setCurrentStatus(input.websiteId,status);
        const res = await xAddStatusChange(
            input.websiteId,
            previousStatus ?? "unknown",
            status
        )
        console.log(res);
    }
}
