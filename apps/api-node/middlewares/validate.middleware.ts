import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";


/*  
 A function that returns another function
    - validateMiddleware(schema) : Returns a middleware function
    - The returned function -> runs for every request
*/
export const validateMiddleware = ( schema : z.ZodType ) => 
    (req : Request, res : Response, next : NextFunction) => {

        const result = schema.safeParse(req.body);
        if(!result.success){
            const errors = result.error.issues.map((err) => ({
                field : err.path.join("."),
                message : err.message
            }))

            return next(new AppError("Invalid request body",422))
        }
        req.body = result.data;
        next();
    }