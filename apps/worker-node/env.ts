import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
    path : "./apps/worker-node/.env"
});

const envSchema = z.object({
    STREAM_NAME : z.string().min(1),
    REGION_NAME : z.string().min(1),
    REGION_ID : z.string().min(1),
    WORKER_ID : z.string().min(1)
})

export const env = envSchema.parse(process.env);