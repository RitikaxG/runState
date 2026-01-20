import { startWorker } from "./worker";
import { env } from "./env";


let shuttingDown = false;
const HEARTBEAT_INTERVAL = 10000;

console.log(JSON.stringify({
    service : "worker-status-change",
    stream : env.STATUS_CHANGE_STREAM,
    workerId : env.STATUS_CHANGE_WORKER_ID,
    status : "STARTED",
    timestamp : new Date().toISOString()
}));

const heartbeat = setInterval(()=>{
    console.log(JSON.stringify({
        service : "worker-status-change",
        stream : env.STATUS_CHANGE_STREAM,
        workerId : env.STATUS_CHANGE_WORKER_ID,
        status : "ALIVE",
        timestamp : new Date().toISOString()
    }))
},HEARTBEAT_INTERVAL);


const shutDown = async ( signal : string ) => {
    if(shuttingDown) return;
    shuttingDown = true;

    console.log(`Worker ${env.STATUS_CHANGE_WORKER_ID} recieved signal ${signal}. 
        Gracefully shutting down`);

    clearInterval(heartbeat);

    await startWorker.stop();
    console.log(JSON.stringify({
        service : "worker-status-change",
        stream : env.STATUS_CHANGE_STREAM,
        workerId : env.STATUS_CHANGE_WORKER_ID,
        status : "STOPPED",
        timestamp : new Date().toISOString()
    }))
    process.exit(0);
}

process.on("SIGINT",shutDown);
process.on("SIGTERM",shutDown);

startWorker();
