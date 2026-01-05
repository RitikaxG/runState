import axios from "axios";
import { describe, it, expect } from "bun:test";

let BASE_URL = `http://localhost:3001`;

describe("RBAC - Admin only List Users & Delete any user",()=>{
    let userToken : string;
    let adminToken : string;
    let userWebsiteId : string;

    it("signin in as admin",async ()=>{
        const res = await axios.post(`${BASE_URL}/api/v1/signin`,{
            email : "runstate-admin@gmail.com",
            password : "runstate-admin-logging"
        })

        adminToken = res.data.data.access_token;
    })

    it("signin as user",async () => {
        const res = await axios.post(`${BASE_URL}/api/v1/signin`,{
            email : "ritika1@gmail.com",
            password : "A@a123456"
        })
        
        userToken = res.data.data.access_token;
    })

    it("user creates website", async() => {
        const res = await axios.post(`${BASE_URL}/api/v1/websites`,{
            url : "https://examples2.com"
        },{
            headers : {
                Authorization : `Bearer ${userToken}`
            }
        })

        expect(res.data.success).toBe(true);
        userWebsiteId = res.data.data.ID;
    })

    it("user cannot access admin endpoint", async () => {
        try{
            const res = await axios.get(`${BASE_URL}/api/v1/admin/users`,{
                headers : {
                    Authorization : `Bearer ${userToken}`
                }
            })
        }catch( err : any ){
            expect(err.response.status).toBe(403)
        }
    })

    it("admin can access admin endpoints", async () => {
        const res = await axios.get(`${BASE_URL}/api/v1/admin/users`,{
            headers : {
                Authorization : `Bearer ${adminToken}`
            }
        })
        expect(res.status).toBe(200);
        console.log(res.data.data);
        expect(Array.isArray(res.data.data)).toBe(true)
    })

    it("admin can delete any user's website", async () => {
        const res = await axios.delete(`${BASE_URL}/api/v1/websites/${userWebsiteId}`,{
            headers : {
                Authorization : `Bearer ${adminToken}`
            }
        })

        expect(res.data.success).toBe(true)
    })
})