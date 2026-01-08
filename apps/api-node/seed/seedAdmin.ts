import dotenv from "dotenv";
import { userRepo } from "../repositories/users.repo";
import { hashPassword } from "../utils/password";
dotenv.config();


export const seedAdmin = async () => {
   
    const adminEmail = process.env.ADMIN_EMAIL as string;
    const adminPassword = process.env.ADMIN_PASSWORD as string;
    
    if(!adminEmail || !adminPassword ){
        console.warn("Admin credentials not set, skipping seeding admin to DB..");
        return;
    }

    const exisitingAdmin = await userRepo.getUserByEmail(adminEmail);
    if(exisitingAdmin){
        console.log("Admin already exists");
        return;
    }

    const hashedPassword = await hashPassword(adminPassword);
    
    await userRepo.create({
        email : adminEmail,
        password : hashedPassword,
        role : "ADMIN"
    })

    console.log("ADMIN seeded")
}