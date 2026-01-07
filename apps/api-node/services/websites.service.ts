import { websiteRepo } from "../repositories/websites.repo";
import { Role } from "@repo/db/client";

export const websiteService = {
    create : async (input : {
        url : string,
        userId : string
    }) => {
        const normalisedUrl = input.url.trim();
        if(!normalisedUrl){
            throw new Error("Invalid URL");
        }

        if(normalisedUrl.includes("localhost")){
            throw new Error("Localhost URL not allowed");
        }

        return websiteRepo.create({
            url : normalisedUrl,
            userId: input.userId
        });
    },

    delete : async (input : {
        userId : string,
        role : Role,
        websiteId : string
    }) => {
        // Since we care about the result to validate user, promise is awaited
        const website = await websiteRepo.getById(input.websiteId);
        if (!website){
            throw new Error(`Website not found`);
        }

        // ADMIN override
        if(input.role === Role.ADMIN){
            return websiteRepo.deleteById(input.websiteId)
        }

        // Ownership check
        if(website.userId !== input.userId){
            throw new Error("Unauthorised : not the website owner")
        }


        // Here we do not care about the result, promise is simply passed upward ( to controller )
        return websiteRepo.deleteByIdAndUserId(input.websiteId, input.userId)
    }
}