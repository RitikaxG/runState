import type { Request, Response, NextFunction } from "express";
import { Role } from "@repo/db/client";
import { AppError } from "../utils/appError";

export const requireRoleMiddleware = ( ...roles : Role[] ) => {
    return ( req : Request, res : Response, next : NextFunction ) => {
        if(!req.user){
            return(new AppError("Unauthorised : no user found",401));
        }

        if(!roles.includes(req.user.role)){
            return next(new AppError("forbidden: you do not have permission",403)); 
        }
        next();
    };
}