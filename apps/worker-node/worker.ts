import { ensureConsumerGroup, xAck, xReadGroup } from "@repo/redis";
import { checkAndUpdateStatus } from "./checker";
import { env } from "./env";

const STREAM_NAME = env.STREAM_NAME;
const REGION_ID = env.REGION_ID;
const REGION_NAME = env.REGION_NAME;
const WORKER_ID = env.WORKER_ID;
console.log(`Starting worker ${WORKER_ID} with stream ${STREAM_NAME} at region ${REGION_ID} ${REGION_NAME}`)

// Worker function
export async function startWorker(){
    
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
                    await checkAndUpdateStatus({
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







    


