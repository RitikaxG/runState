import { prisma } from "@repo/db/client";

export const websiteRepo = {
    getUserEmailByWebsiteId : async ( websiteId : string ) => {
        return prisma.website.findUnique({
            where : {
                id : websiteId
            },select : {
                user : {
                    select : {
                        email : true,
                    }
                }
            }
        })
    }
}