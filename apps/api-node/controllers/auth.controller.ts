import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export const authController = {
    refresh :  async (req : Request, res : Response, next : NextFunction ) => {
        const { refresh_token : refreshToken } = req.body;

        try{
            const response = await authService.refresh(refreshToken);
            res.status(200).json({
                success : true,
                message : "Successfully refreshed token",
                data  : response
            })
        }
        catch(err){
            next(err)
        }
    },

    logout : async (req : Request, res : Response, next : NextFunction ) => {
        try{
            const { refresh_token: refreshToken } = req.body;

            await authService.logout(refreshToken);
            res.status(200).json({
                success : true,
                message : "Successfully logged out"
            })
        }
        catch(err){
            next(err)
        }
    }
}