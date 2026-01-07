import { prisma } from "@repo/db/client";

/*
Repository Layer talks to the database.
*/

// websiteRepo is an object with functions
export const websiteRepo = {
    // 'create' fn returns a promise
    // Service or Controller decides when to await
    create : (
        data : {
            url : string,
            userId : string
        }
    ) => {
        return prisma.website.create({data})
    },

   getById : ( websiteId : string ) => {
    return prisma.website.findUnique({
        where : {
            id : websiteId
        }
    })
   },

   deleteByIdAndUserId : ( websiteId : string, userId : string ) => {
    return prisma.website.deleteMany({
        where : {
            id : websiteId,
            userId : userId
        }
    })
   },

   deleteById : (websiteId : string ) => {
    return prisma.website.delete({
        where : {
            id : websiteId
        }
    })
   }
}