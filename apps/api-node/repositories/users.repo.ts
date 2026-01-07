import { prisma, Role } from "@repo/db/client";

export const userRepo = {
    create : (data : {
        email : string,
        password : string,
        role : Role
    }) => {
        return prisma.user.create({data})
    },

    getUserByEmail : ( email : string ) => {
        return prisma.user.findUnique({
            where : {
                email
            }
        })
    },

    listUsers : () => {
        return prisma.user.findMany()
    },

    getById : ( userId : string ) => {
        return prisma.user.findUnique({
            where : {
                id : userId
            }
        })
    }
}