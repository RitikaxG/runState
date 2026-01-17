import { ensureConsumerGroup, xAck, xReadGroup } from "@repo/redis";
import { checkAndUpdateStatus } from "./checker";
import { env } from "./env";

const MONITORING_STREAM = env.MONITORING_STREAM;
const MONITORING_REGION_ID = env.MONITORING_REGION_ID;
const MONITORING_REGION_NAME = env.MONITORING_REGION_NAME;
const MONITORING_WORKER_ID = env.MONITORING_WORKER_ID;
console.log(`Starting worker ${MONITORING_WORKER_ID} with stream ${MONITORING_STREAM} at region ${MONITORING_REGION_ID} ${MONITORING_REGION_NAME}`)

// Worker function
export async function startWorker(){
    
    await ensureConsumerGroup(MONITORING_STREAM, MONITORING_REGION_NAME);
    
    while(true){
        // Read from Stream
        const res = await xReadGroup(
            MONITORING_STREAM,
            MONITORING_REGION_NAME,
            MONITORING_WORKER_ID
        );
       
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
                        url : message.url!,
                        regionId : MONITORING_REGION_ID
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
                await xAck( MONITORING_STREAM,MONITORING_REGION_NAME,ackIds); // Redis removes them from pending list
            }

        }
    }
}







    


