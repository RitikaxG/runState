import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
    path : "./apps/worker-status-change/.env"
});

const envSchema = z.object({
    STATUS_CHANGE_STREAM : z.string().min(1),
    STATUS_CHANGE_WORKER_ID : z.string().min(1),
})

export const env = envSchema.parse(process.env);