import { ensureConsumerGroup, xReadGroup, xAck, xAddNotifyStream } from "@repo/redis";
import { env } from "./env";
const STATUS_CHANGE_STREAM = env.STATUS_CHANGE_STREAM;
const STATUS_CHANGE_WORKER_ID = env.STATUS_CHANGE_WORKER_ID;

const STATUS_CHANGE_CONSUMER_GROUP = "status-change-group";

console.log(`Starting worker ${STATUS_CHANGE_WORKER_ID} with stream ${STATUS_CHANGE_STREAM} at region ${STATUS_CHANGE_CONSUMER_GROUP}`)

let isRunning = true;
let inFlight = 0;

const sleep = (ms : number ) => {
    return new Promise(res => setTimeout(res,ms));
}

// Consumes STATUS_CHANGE events and decide what action should be taken
export async function runWorker(){
    
    await ensureConsumerGroup(
        STATUS_CHANGE_STREAM, 
        STATUS_CHANGE_CONSUMER_GROUP
    );
    
    while(isRunning){
        // Read from Stream
        const res = await xReadGroup(
            STATUS_CHANGE_STREAM,
            STATUS_CHANGE_CONSUMER_GROUP,
            STATUS_CHANGE_WORKER_ID
        );

        if(!res || res.length === 0){
            await sleep(100);
            continue;
        }
        
        // Iterating over each stream reponse (here only one : betteruptime:website-ticks stream)
        for(const { messages } of res){

            /*
             - Creates an array of promises
             - Each promise represents one website check
            */
            const tasks = messages.map(async ({ id, message }) => {
                inFlight++;
                try{
                    if(!message.prevStatus || !message.currentStatus
                        || !message.occurredAt
                    ){
                        console.error(`Invalid worker status stream input message`);
                        return null;
                    }

                    const res = await xAddNotifyStream({
                        websiteId : message.websiteId,
                        prevStatus : message.prevStatus,
                        currentStatus : message.currentStatus,
                        occurredAt : message.occurredAt
                    });
                    console.log(`Added to notification stream`,res);
                    return id;
                }catch(err){
                    console.error("Status Change Worker failed",message.websiteId,err);
                    return null;
                    
                }finally{
                    inFlight--;
                }
            })

            /*
            -  Run all website checks concurrently 
            -  Filter successful once only ( Messages that were successfully processed )
            */
            const ackIds = ((await Promise.all((tasks))).filter(Boolean) as string[]);
            console.log(ackIds);
            if(ackIds.length > 0){
                await xAck( STATUS_CHANGE_STREAM,STATUS_CHANGE_CONSUMER_GROUP,ackIds); // Redis removes them from pending list
            }

        }
    }
}

export const startWorker = Object.assign(runWorker,{
    async stop(){
        const SHUTDOWN_TIMEOUT = 10000;
        const start = Date.now();

        console.log(`Worker ${env.STATUS_CHANGE_WORKER_ID} requested shutdown.`);
        isRunning = false;
        

        while(inFlight > 0){
            if(Date.now() - start > SHUTDOWN_TIMEOUT){
                console.log(`Forced shutdown with ${inFlight} in flight jobs`);
                break;
            }
            console.log(`Waiting for ${inFlight} in-flight jobs`);
            await sleep(500);
        }
        console.log(`Worker shutdown complete.`)
    }
})
