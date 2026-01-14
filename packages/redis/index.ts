import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config({
    path : "./packages/redis/.env"
});

const client = await createClient()
                .on("error",err => console.log("Redis Client Error",err))
                .connect();


const STREAM_NAME = process.env.STREAM_NAME as string;
console.log(STREAM_NAME);

if(!STREAM_NAME){
    throw new Error("Stream name not found");
}

interface WebsiteEvent {
    websiteId : string,
    url : string
}

const xAdd = async ( websiteId : string, url : string ) => {
    await client.xAdd(
        STREAM_NAME,"*",{
            websiteId,
            url
        },{
            TRIM : {
                strategy : "MAXLEN",
                strategyModifier : "~",
                threshold : 200000
            }
        }
    )
}   

export const xAddBulk = async ( websites : WebsiteEvent[], batchSize = 200 ) => {
    for(let i=0;i<websites.length;i+=batchSize){
        const batch = websites.slice(i,i+batchSize);
        
        await Promise.all(batch.map(w => 
            xAdd(w.websiteId,w.url)
        ))
    }
}

type StreamMessage = {
    id : string, // redis msg id
    message : {
        websiteId : string,
        url : string
    }
}

type StreamResponse = {
    name : string,
    messages : StreamMessage[]
}

export const xReadGroup = async ( 
    consumerGroup : string, 
    workerId : string ) : Promise<StreamResponse[] | null> => {

    const res = await client.xReadGroup(
        consumerGroup,
        workerId,{
            key : STREAM_NAME,
            id : ">"
        },{
            COUNT : 5,
            BLOCK : 5000
        }
    )
    return res as StreamResponse[] | null;
}

// Add retry logic if it fails
export const xAck = async ( consumerGroup : string, messageIds : string[] | string ) => {
    const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
    await client.xAck(
        STREAM_NAME,
        consumerGroup,
        ids
    )
}




// Where will create consumer group logic lie ? worker / pusher
export const ensureConsumerGroup = async (stream : string, consumerGroup : string) => {
    try{
        await client.xGroupCreate(
            stream,
            consumerGroup,
            "0",{
                MKSTREAM : true // Create if it doesnt already exists
            }
        )
    }catch(err:any){    
        if(!err.message.includes("BUSYGROUP")){
            return;
        }
        throw err;
        
    }
    
}