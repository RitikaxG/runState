import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
    path : "./apps/worker-node/.env"
});

const envSchema = z.object({
    MONITORING_STREAM : z.string().min(1),
    MONITORING_REGION_NAME : z.string().min(1),
    MONITORING_REGION_ID : z.string().min(1),
    MONITORING_WORKER_ID : z.string().min(1)
})

export const env = envSchema.parse(process.env);