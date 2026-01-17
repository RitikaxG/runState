import { startWorker } from "./worker";
import { env } from "./env";

console.log(`Starting worker ${env.MONITORING_WORKER_ID} for region ${env.MONITORING_REGION_NAME}`);
startWorker();