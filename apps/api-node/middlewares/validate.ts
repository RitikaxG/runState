import { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";
import { error } from "console";


/*  
 A function that returns another function
    - validateMiddleware(schema) : Returns a middleware function
    - The returned function -> runs for every request
*/
export const validateMiddleware = ( schema : ZodSchema) => 
    (req : Request, res : Response, next : NextFunction) => {

        const result = schema.safeParse(req.body);
        if(!result.success){
            const errors = result.error.errors.map((err) => ({
                field : err.path.join("."),
                message : err.message
            }))

            return res.status(422).json({
                message : "Invalid request body",
                errors : errors
            })
        }
        req.body = result.data;
        next();
    }