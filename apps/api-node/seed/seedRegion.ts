import { prisma } from "@repo/db/client";


export const seedRegion = async () => {
    try{
        await prisma.region.createMany({
            data : [
                { name : "ap-south-1" },
                { name : "us-east-1" },
                { name : "eu-west-1" }
            ],
            skipDuplicates : true
        })
        console.log("Region seeded successfully");
    }catch(err){
        console.error("Error seeding regions",err);
        throw err;
    }
}


