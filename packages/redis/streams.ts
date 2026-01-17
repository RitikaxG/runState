import { client } from "./client";
import dotenv from "dotenv";
import type { StreamResponse, WebsiteEvent } from "./types";
dotenv.config({
    path : "./packages/redis/.env"
});


const MONITORING_STREAM = process.env.MONITORING_STREAM as string;
console.log(MONITORING_STREAM);
if(!MONITORING_STREAM){
    throw new Error("Stream name not found");
}

const xAdd = async ( websiteId : string, url : string ) => {
    await client.xAdd(
        MONITORING_STREAM,"*",{
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


export const xReadGroup = async ( 
    stream : string,
    consumerGroup : string, 
    workerId : string ) : Promise<StreamResponse[] | null> => {

    const res = await client.xReadGroup(
        consumerGroup,
        workerId,{
            key : stream,
            id : ">"
        },{
            COUNT : 5,
            BLOCK : 5000
        }
    )
    return res as StreamResponse[] | null;
}

// Add retry logic if it fails
export const xAck = async ( stream: string, consumerGroup : string, messageIds : string[] | string ) => {
    const ids = Array.isArray(messageIds) ? messageIds : [messageIds];
    await client.xAck(
        stream,
        consumerGroup,
        ids
    )
}


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
        if(err.message.includes("BUSYGROUP")){
            return;
        }
        throw err;
        
    }
    
}