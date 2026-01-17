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
const startReclaimLoop = async () => {
    while(true){
        try{
            await reclaimPendingNotification(
                NOTIFICATION_STREAM,
                NOTIFICATION_CONSUMER_GROUP,
                NOTIFICATION_WORKER_ID
            )
        }catch(err){
            console.error(`Reclaim failed`,err);
        }

        await sleep(30000);
    }
}

// Consumes STATUS_CHANGE events and decide what action should be taken
export async function startWorker(){
    
    await ensureConsumerGroup(
        NOTIFICATION_STREAM, 
        NOTIFICATION_CONSUMER_GROUP
    );

    startReclaimLoop();
    
    while(true){
        // Read from Stream
        const res = await xReadGroup(
            NOTIFICATION_STREAM,
            NOTIFICATION_CONSUMER_GROUP,
            NOTIFICATION_WORKER_ID
        );
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
                    }

                    
                }catch(err){
                    console.error("Notification Worker failed",
                                    message.websiteId,
                                    err);
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
