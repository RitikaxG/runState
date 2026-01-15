import { startWorker } from "./worker";
import { env } from "./env";

console.log(`Starting worker ${env.WORKER_ID} for region ${env.REGION_NAME}`);
startWorker();