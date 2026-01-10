import axios from "axios";
import { describe, it, expect } from "bun:test";
import { BACKEND_NODE_URL } from "./config";

export const generateUrls = () => {
    const chars = `abcdefghijklmnopqrstuvwxyz0123456789`;
    
    let slug = "";
    for (let i=0;i<8;i++){
        slug += chars[Math.floor(Math.random()*chars.length)]
    }
   
    return `http://${slug}.com`;
}

describe("RBAC - Admin only List Users & Delete any user",()=>{
    let userToken : string;
    let adminToken : string;
    let userWebsiteId : string;

    it("signin in as admin",async ()=>{
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/signin`,{
            email : "runstate-admin@gmail.com",
            password : "runstate-admin-logging"
        })

        adminToken = res.data.data.access_token;
        console.log(adminToken);
    })

    it("signin as user",async () => {
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/signin`,{
            email : "ritikag@gmail.com",
            password : "A@a123456"
        })
        
        userToken = res.data.data.access_token;
    })

    it("user creates website", async() => {
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/websites`,{
            url : generateUrls()
        },{
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })
        console.log(res.data);
        expect(res.data.success).toBe(true);
        userWebsiteId = res.data.data.ID || res.data.data.id;
        console.log(userWebsiteId);
    })

    it("user cannot access admin endpoint", async () => {
         expect.assertions(1);
        try{
            const res = await axios.get(`${BACKEND_NODE_URL}/api/v1/admin/users`,{
                headers : {
                    Authorization : `Bearer ${userToken}`
                }
            })
        }catch( err : any ){
            expect(err.response.status).toBe(403)
        }
    })

    it("admin can access admin endpoints", async () => {
        const res = await axios.get(`${BACKEND_NODE_URL}/api/v1/admin/users`,{
            headers : {
                Authorization : `Bearer ${adminToken}`
            }
        })
        expect(res.status).toBe(200);
        console.log(res.data.data);
        expect(Array.isArray(res.data.data)).toBe(true)
    })

    it("admin can delete any user's website", async () => {
        const res = await axios.delete(`${BACKEND_NODE_URL}/api/v1/websites/${userWebsiteId}`,{
            headers : {
                Authorization : `Bearer ${adminToken}`
            }
        })
        console.log(res.data);
        expect(res.data.success).toBe(true)
    })
})