import { websiteService } from "../services/websites.service";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export const websiteController = {
    create : async (req : Request, res : Response, next : NextFunction ) => {
        try{
            const { id : userId } = req.user!;

            const website = await websiteService.create({
                url : req.body.url,
                userId 
            });

            res.status(201).json({
                success : true,
                message : "Website created successfully",
                data : website
            })
        }
        catch(err){
            next(err) // send error to middleware
        }
    },

    delete : async (req : Request, res: Response, next : NextFunction ) => {
        try{
            const {id : websiteId } = req.params;

            if(!websiteId){
                return next(new AppError("WebsiteId not found",400))
            }
            
            const {id : userId, role } = req.user!;

            await websiteService.delete({
                websiteId,
                userId,
                role 
            });
            res.status(200).json({
                success : true,
                message : "Website successfully deleted"
            })
        }
        catch(err){
            next(err)
        }
    }
}