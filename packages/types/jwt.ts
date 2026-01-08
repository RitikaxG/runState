import type { Role } from "@repo/db/client";

export interface JWTPayload {
    userId : string,
    role : Role
}
