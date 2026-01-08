import type { Request, Response, NextFunction } from "express";
import { validateAccessToken } from "../utils/jwt";
import {} from "@repo/types";
import { AppError } from "../utils/appError";

export const authMiddleware = () => {
    return  (req : Request, res : Response,next : NextFunction) => {
    
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return next( new AppError("Authorization header missing",401));
    }

    const [scheme, token] = authHeader.split(" ").map(s => s.trim());

    if(scheme != "Bearer" || !token){
        return next(new AppError("Invalid authorization format",401));
    }

    try{
        const payload = validateAccessToken(token);
        // Populating req.user
        req.user = {
            id : payload.userId,
            role : payload.role
        }
        next();
    }
    catch(err){
       return next(new AppError("Invalid or expired token",401));
    }
}
}
