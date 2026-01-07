import { userRepo } from "../repositories/users.repo";
import { comparePassword, hashPassword } from "../utils/password";
import { Role } from "@repo/db/client";

export const userService = {
    signUp : async(input : {
        email : string,
        password : string
    }) => {
        const exisiting = await userRepo.getUserByEmail(input.email)
        if(exisiting){
            throw new Error("User already exists")
        }

        const hashedPassword = await hashPassword(input.password);
        const user = await userRepo.create({
            email : input.email,
            role : Role.USER, // DEFAULT
            password : hashedPassword
        })

        return {
            id : user.id,
            email : user.email,
            role : user.role,
            createdAt : user.createdAt
        }
    },

    authenticate : async (input : {
        email : string,
        password : string
    }) => {
        const user = await userRepo.getUserByEmail(input.email)
        if(!user){
            throw new Error("Unauthenticated : user not found")
        }

        const isValid = await comparePassword(input.password, user.password);
        if(!isValid){
            throw new Error("Invalid Password")
        }

        return {
            id : user.id,
            email : user.email,
            role : user.role,
            createdAt : user.createdAt
        }
    },

    listUsers : async () => {
        const users = await userRepo.listUsers();
        return users.map((user) => ({
            id : user.id,
            email : user.email,
            role : user.role,
            createdAt : user.createdAt
        }))
    }
}