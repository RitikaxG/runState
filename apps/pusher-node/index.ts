import { prisma } from "@repo/db/client";
import { xAddBulk  } from "@repo/redis";

const INTERVAL_MS = 3*1000;
let isRunning = true;
let shuttingDown = false;
const sleep = ( ms : number ) => {
    return new Promise((res) => setTimeout(res,ms));
}

async function main(){
    
    const websites = await prisma.website.findMany({
        select : {
            id : true,
            url : true
        }
    })

    const startTime = Date.now();

    await xAddBulk(websites.map((w) => ({
        websiteId : w.id,
        url : w.url
    })
))
    
    console.log(`Pushed ${websites.length} website event in ${Date.now() - startTime} ms`);
}

/*

setInterval() : does not wait for async function 
 - If main() takes longer than 3 min next main() gets called leading to overlap
 - use setTimeout()

*/

async function start(){
    while(isRunning){
        try{
            await main();
        }catch(err){
            console.error("Pusher failed",err)
        }
        
        await sleep(INTERVAL_MS);
    }
}

start();

const HEARTBEAT_INTERVAL = 10000;
const heartBeat = setInterval(()=>{

    console.log(JSON.stringify({
        service : "worker-monitoring-pusher",
        status : "ALIVE",
        timestamp : new Date().toISOString()
    }))

},HEARTBEAT_INTERVAL);

const shutDown = ( signal : string ) => {
    if(shuttingDown) return;
    shuttingDown = true;

    console.log(JSON.stringify({
        service : "worker-monitoring-pusher",
        status : "STOPPING",
        signal,
        timestamp : new Date().toISOString()
    }))

    isRunning = false;

    clearInterval(heartBeat);
    console.log(JSON.stringify({
        service : "worker-monitoring-pusher",
        status : "STOPPED",
        timestamp : new Date().toISOString()
    }))

    process.exit(0);
}

process.on("SIGINT",shutDown);
process.on("SIGTERM",shutDown);
