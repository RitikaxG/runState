import { UrlSchema } from "../common/url";
import { z } from "zod";

export const createWebsiteSchema = z.object({
    url : UrlSchema
})