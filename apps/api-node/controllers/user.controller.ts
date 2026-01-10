import type { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";

export const userController = {
    signup : async ( req : Request, res : Response, next : NextFunction ) => {
        try{
            const { email, password } = req.body;

            const newUser = await userService.signUp({
                email,
                password 
            })
            res.status(201).json({
                success : true,
                message : "User successfully created",
                data : newUser
            })
        }
        catch(err){
            next(err)
        }
    },

    signin : async (req : Request, res : Response, next : NextFunction ) => {
        try{
            const { email, password } = req.body;

            const response = await authService.signin({
                email,
                password 
            })
            res.status(201).json({
                success : true,
                message : "User successfully signed in",
                data : response
            })

        }catch(err){
            next(err)
        }
    },
    // Admin only endpoint
    listUsers : async (req : Request, res : Response, next : NextFunction ) => {
        try{
            const users = await userService.listUsers();
            res.status(200).json({
                success : true,
                message : "Successfully listed users",
                data : users
            })
        }catch(err){
            next(err)
        }
    }
}