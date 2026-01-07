import Router from "express";
import type { Request, Response } from "express";
import { prisma } from "@repo/db/client";
import { createWebsiteSchema } from "@repo/schemas";


export const websitesRouter = Router();

// List all websites
websitesRouter.get("/", async (req : Request, res : Response ) => {
    try{
        const websites = await prisma.website.findMany();
        res.status(200).json({
            message : "All websites fetched successfully",
            websites
        })
    }
    catch(err){
        if(err instanceof Error){
            console.error(`Error fetching websites ${err}`);
            res.status(500).json({
                message : `Error fetching websites`,
                error : err
            })
        }
    }
})

// Create new website
websitesRouter.post("/", async (req : Request, res : Response ) => {
 

    const parsedDataWithSchema = createWebsiteSchema.safeParse(req.body);

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
    const { url } = parsedDataWithSchema.data;

    try{
        const newWebsite = await prisma.website.create({
            data : {
                url,
                userId : "1"
            }
        })
        return res.status(201).json({
            message : "Website created successfully",
            id : newWebsite.id
        })
    }
    catch(err){
        if(err instanceof Error){
            console.error(`Error creating new website ${err}`);
            return res.status(500).json({
                message : "Unable to create new website",
                err
            })
        }
    }
    
})
// Update / Fetch status of a particular website
websitesRouter.post("/:websiteId/status",async (req : Request, res : Response ) => {
    
})