import { app } from "./app";
import { seedAdmin } from "./seed/seedAdmin";
import { prisma } from "@repo/db/client";
import dotenv from "dotenv";
import { seedRegion } from "./seed/seedRegion";
dotenv.config();

async function startServer (){
    try{
        await prisma.$connect();
        console.log("DB connected");

        await seedAdmin();
        await seedRegion();

        app.listen(3000,() => {
            console.log("Listening on port 3000");
        })
    }catch(err){
        console.error(`Server failed to start ${err}`);
        process.exit(1)
    }
}

startServer();
