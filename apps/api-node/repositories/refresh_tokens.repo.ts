import { prisma } from "@repo/db/client";

export const refreshTokenRepo = {

    create : (data : {
        userId : string,
        tokenHash : string,
        expiresAt : Date
    }) => {
        return prisma.refreshToken.create({data})
    },

    findValid : ( tokenHash : string ) => {
        return prisma.refreshToken.findFirst({
            where : {
                tokenHash,
                expiresAt :{
                    gt : new Date()
                },
                revoked : false
            }
        })
    },

    revoke : (tokenHash : string ) => {
        return prisma.refreshToken.updateMany({
            where : {
                tokenHash,
                revoked : false
            },
            data : {
                revoked : true
            }
        })
    }
}