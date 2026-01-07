import jwt  from "jsonwebtoken";
import dotenv from "dotenv";
import type { JWTPayload } from "@repo/types";
import crypto from "crypto";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

export const generateAccessToken = (payload : JWTPayload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn : "15m"
    });
};

export const generateRefreshToken = (payload : JWTPayload) => {
    return crypto.randomBytes(32).toString("base64url")
};

export const validateAccessToken = (token : string) => {
    return jwt.verify(token,JWT_SECRET) as JWTPayload;
};