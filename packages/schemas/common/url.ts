import { z } from "zod";

export const UrlSchema = z.string().url().max(2048).refine((url) => !url.includes("localhost"),{
    message : "Localhost URLs are not allowed"
})