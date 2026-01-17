import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
    path : "./apps/worker-notification/.env"
});

const envSchema = z.object({
    NOTIFICATION_STREAM : z.string().min(1),
    NOTIFICATION_WORKER_ID : z.string().min(1)
})

export const env = envSchema.parse(process.env);