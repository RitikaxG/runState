import { startWorker } from "./worker";
import { env } from "./env";

console.log(`Starting worker ${env.STATUS_CHANGE_WORKER_ID}`);
startWorker();