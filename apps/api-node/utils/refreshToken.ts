import crypto from "crypto";
import type { JWTPayload } from "@repo/types";

export const generateRefreshToken = () => {
    /*
    - crypto.randomBytes(32) : Generates 32 bytes of true cryptographic randomness
    - .toString("base64url") : converts raw bytes to string
    */
    return crypto.randomBytes(32).toString("base64url")
};

export const hashRefreshToken = (token : string) => {
    /*
    - crypto.createHash("sha256") : Creates SHA 256 hash function
    - .update(token) : Feeds refresh token into hash function
    - .digest("hex") : outputs the hash as a hex string
    */
    return crypto.createHash("sha256").update(token).digest("hex");
}
