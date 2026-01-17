import { ensureConsumerGroup, xReadGroup, xAck, xAddNotifyStream } from "@repo/redis";
import { env } from "./env";
const STATUS_CHANGE_STREAM = env.STATUS_CHANGE_STREAM;
const STATUS_CHANGE_WORKER_ID = env.STATUS_CHANGE_WORKER_ID;

const STATUS_CHANGE_CONSUMER_GROUP = "status-change-group";

console.log(`Starting worker ${STATUS_CHANGE_WORKER_ID} with stream ${STATUS_CHANGE_STREAM} at region ${STATUS_CHANGE_CONSUMER_GROUP}`)

// Consumes STATUS_CHANGE events and decide what action should be taken
export async function startWorker(){
    
    await ensureConsumerGroup(
        STATUS_CHANGE_STREAM, 
        STATUS_CHANGE_CONSUMER_GROUP
    );
    
    while(true){
        // Read from Stream
        const res = await xReadGroup(
            STATUS_CHANGE_STREAM,
            STATUS_CHANGE_CONSUMER_GROUP,
            STATUS_CHANGE_WORKER_ID
        );
        if(!res){
            await new Promise(res => setTimeout(res,100))
            console.log(res);
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
                    if(!message.prevStatus || !message.currentStatus
                        || !message.occurredAt
                    ){
                        return null;
                    }

                    await xAddNotifyStream({
                        websiteId : message.websiteId,
                        prevStatus : message.prevStatus,
                        currentStatus : message.currentStatus,
                        occurredAt : message.occurredAt
                    });
                    return id;
                }catch(err){
                    console.error("Status Change Worker failed",message.websiteId,err);
                    return null;
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
