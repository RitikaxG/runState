import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "@repo/db/client";
import dotenv from "dotenv";
import { SignupSchema } from "@repo/schemas"
dotenv.config();

export const UserRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET;

UserRouter.post("/signup",async (req : Request, res : Response) => {

    const parsedDataWithSchema = SignupSchema.safeParse(req.body);
    if(!parsedDataWithSchema.success){
         const errors = parsedDataWithSchema.error.errors.map((err) => ({
            field : err.path.join("."),
            message : err.message
        }))

        return res.status(422).json({
            message : "Error in input format",
            errors
        })
    }

    const { email,password } = parsedDataWithSchema.data;


})
