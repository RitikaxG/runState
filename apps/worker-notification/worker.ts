import { ensureConsumerGroup, xReadGroup, xAck, reclaimPendingNotification } from "@repo/redis";
import { env } from "./env";
import { sendNotification } from "./sendNotification";

const NOTIFICATION_STREAM = env.NOTIFICATION_STREAM;
const NOTIFICATION_WORKER_ID = env.NOTIFICATION_WORKER_ID;

const NOTIFICATION_CONSUMER_GROUP = "notification-group";

console.log(`Starting notification worker ${NOTIFICATION_WORKER_ID} on ${NOTIFICATION_STREAM}`);

const sleep = (ms : number) => {
    return new Promise(res => setTimeout(res,ms));
}

let isRunning = true;
let inFlight = 0;

const startReclaimLoop = async () => {
    while(isRunning){
        try{
            const res = await reclaimPendingNotification(
                NOTIFICATION_STREAM,
                NOTIFICATION_CONSUMER_GROUP,
                NOTIFICATION_WORKER_ID
            )
            console.log(res);
        }catch(err){
            console.error(`Reclaim failed`,err);
        }

        await sleep(30000);
    }
}

// Consumes STATUS_CHANGE events and decide what action should be taken
export async function runWorker(){
    
    await ensureConsumerGroup(
        NOTIFICATION_STREAM, 
        NOTIFICATION_CONSUMER_GROUP
    );

    startReclaimLoop();
    
    while(isRunning){
        // Read from Stream
        const res = await xReadGroup(
            NOTIFICATION_STREAM,
            NOTIFICATION_CONSUMER_GROUP,
            NOTIFICATION_WORKER_ID
        );
        console.log(`Read from betteruptime:website-status-notification`,res);
        if(!res){
            await sleep(1000);
            continue;
        }
        
        // Iterating over each stream reponse (here only one : betteruptime:website-ticks stream)
        for(const { messages } of res){
            const ackIds :string[] = [];
            /*
             - Creates an array of promises
             - Each promise represents one website check
            */
            await Promise.all(messages.map(async ({ id, message }) => {

                if (!message.prevStatus || !message.currentStatus 
                        || !message.occurredAt) {
                        console.error("Invalid notification message", message);
                        return;
                }

                inFlight++;
                try{
                    
                    const result = await sendNotification(id,{
                        websiteId : message.websiteId,
                        prevStatus : message.prevStatus,
                        currentStatus : message.currentStatus,
                        occurredAt : message.occurredAt
                    });

                    // Only ACK messages that were actually handled
                    if(result === "SENT" || result === "DLQ"){
                        ackIds.push(id);
                        console.log(id);
                    }

                    
                }catch(err){
                    console.error("Notification Worker failed",
                                    message.websiteId,
                                    err);
                }finally{
                    inFlight--;
                }
            }))

            /*
            -  Run all website checks concurrently 
            -  Filter successful once only ( Messages that were successfully processed )
            */
            if(ackIds.length > 0){
                await xAck( NOTIFICATION_STREAM ,
                            NOTIFICATION_CONSUMER_GROUP ,
                            ackIds); // Redis removes them from pending list
            }

        }
        
    }
}

export const workerStats = {
    getInflight: () => inFlight
}


export const startWorker = Object.assign(runWorker,{
    
    async stop(){
        const SHUTDOWN_TIMEOUT = 10000;
        const start = Date.now();
        
        console.log(`Worker ${NOTIFICATION_WORKER_ID} stop requested`);
        isRunning = false;

        // Wait for inflight jobs 
        while(inFlight > 0){
            if(Date.now() - start > SHUTDOWN_TIMEOUT){
                console.log(`Forcing shutdown with inflight jobs ${inFlight}`);
                break;
            }
            console.log(`Waiting for ${inFlight} in flight jobs`);
            await sleep(500);
        }
        console.log("Worker shutdown complete");
    }
})