import "express";
import { Role } from "@repo/db/client";
import type { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            user? : {
                id : string,
                role : Role
            }
        }
    }
}