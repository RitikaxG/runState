import axios from "axios";
import { describe, expect, it } from "bun:test";
import { BACKEND_NODE_URL } from "./config";

export const generateUser = () => {
    const chars = `abcdefghijklmnopqrstuvwxyz0123456789`;
    let slug = "";
    for(let i=0;i<7;i++){
        slug += Math.floor(Math.random() * chars.length);
    }
    return `${slug}@gmail.com`;
}


describe("Signup Signin User",()=>{
    it("Signup - Create a user",async () => {
        const newUser = generateUser();
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/signup`,{
            email : newUser,
            password : "A@a123456"
        })

        expect(res.data.success).toBe(true);
        expect(res.data.data.email).toBe(newUser);
    })
    it("Signin - Return JWT",async ()=>{
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/signin`,{
            email : "ritikag@gmail.com",
            password : "A@a123456"
        })

        expect(res.data.data).toBeDefined();
    })
})