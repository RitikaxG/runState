import { startWorker } from "./worker";
import { env } from "./env";

let shuttingDown = false;
const HEARTBEAT_INTERVAL = 10000;

console.log(JSON.stringify({
    service : "worker-monitoring",
    stream : env.MONITORING_STREAM,
    workerId : env.MONITORING_WORKER_ID,
    regionId : env.MONITORING_REGION_ID,
    regionName : env.MONITORING_REGION_NAME,
    status : "STARTED",
    timestamp : new Date().toISOString()
}))

const heartbeat = setInterval(()=>{
    console.log(JSON.stringify({
        service : "worker-monitoring",
        stream : env.MONITORING_STREAM,
        workerId : env.MONITORING_WORKER_ID,
        regionId : env.MONITORING_REGION_ID,
        regionName : env.MONITORING_REGION_NAME,
        status : "ALIVE",
        timeStamp : new Date().toISOString(),
    }))
},HEARTBEAT_INTERVAL);

const shutDown = async (signal : string) => {
    if(shuttingDown) return;
    shuttingDown = true;
    console.log(`Worker ${env.MONITORING_WORKER_ID} received ${signal}.
         Gracefully shutting down..`);

    
    clearInterval(heartbeat);

    await startWorker.stop();
    console.log(JSON.stringify({
        service : "worker-monitoring",
        stream : env.MONITORING_STREAM,
        workerId : env.MONITORING_WORKER_ID,
        regionId : env.MONITORING_REGION_ID,
        regionName : env.MONITORING_REGION_NAME,
        status : "STOPPED",
        timestamp : new Date().toISOString()
    }))
    process.exit(0);
}

process.on("SIGINT",shutDown);
process.on("SIGTERM",shutDown);

startWorker();