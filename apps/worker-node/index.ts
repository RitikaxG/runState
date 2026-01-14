import axios from "axios";
import { prisma } from "@repo/db/client";
import dotenv from "dotenv";
import { ensureConsumerGroup, xAck, xReadGroup } from "@repo/redis";

dotenv.config({
    path : "./apps/worker-node/.env"
});

const STREAM_NAME = process.env.STREAM_NAME as string;
const WORKER_ID = process.env.WORKER_ID as string;
const REGION_NAME = process.env.REGION_NAME as string;
const REGION_ID = process.env.REGION_ID as string;

if(!STREAM_NAME){
    throw new Error("STREAM_NAME not found");
}

if(!WORKER_ID){
    throw new Error("WORKER_ID not found");
}

if(!REGION_NAME){
    throw new Error("REGION_NAME not found")
}

if(!REGION_ID){
    throw new Error("REGION_ID not found")
}

// Step 4 : Write Worker function
async function main(){
    
    await ensureConsumerGroup(STREAM_NAME, REGION_NAME);
    
    while(true){
        // Read from Stream
        const res = await xReadGroup(REGION_NAME,WORKER_ID);
        if(!res){
            continue;
        }
        
        // Iterating over each stream reponse (here only one : betteruptime:website-ticks stream)
        for(const { messages } of res){

            /*
             - Creates an array of promises
             - Each promise represents one website check
            */
            const tasks = messages.map(async ({ id, message }) => {
                try{
                    await checkWebsite({
                        websiteId : message.websiteId,
                        url : message.url,
                        regionId : REGION_ID
                    });
                    return id;
                }catch(err){
                    console.error("Worker failed",message.websiteId,err);
                    return null;
                }
            })

            /*
            -  Run all website checks concurrently 
            -  Filter successful once only ( Messages that were successfully processed )
            */
            const ackIds = ((await Promise.all((tasks))).filter(Boolean) as string[]);
            console.log(ackIds);
            if(ackIds.length){
                await xAck(REGION_NAME,ackIds); // Redis removes them from pending list
            }

        }
    }
}


// Step 1 : Define worker input
export interface WebsiteCheckInput {
    websiteId : string,
    regionId : string,
    url : string
}

// Step 2 : Define status decision logic
const getWebsiteStatus = (statusCode : number | null) : "up"|"down"|"unknown" => {
    if(statusCode === null) return "unknown"
    else if(statusCode >= 200 && statusCode < 400) return "up"
    return "down"
}

// Step 3 : Write the function to check website status (one unit of work )
export const checkWebsite = async (input : WebsiteCheckInput ) => {
    const startTime = Date.now();

    let statusCode : number | null;

    try{
        // 1. Update Website Status
        const response = await axios.get(input.url,{
            timeout : 5*1000, // 5 sec
            validateStatus : () => true
        })

        statusCode = response.status;
        console.log(statusCode);
    }catch(err){
        statusCode = null
    }

    // 2. Update Response Time
    const responseTimeMs = Date.now() - startTime;
    const status = getWebsiteStatus(statusCode);

    // 3. Store to WebsiteTicks
    await prisma.websiteTicks.create({
        data : {
            status,
            responseTimeMs,
            websiteId : input.websiteId,
            regionId : input.regionId
        }
    })
}


main();

