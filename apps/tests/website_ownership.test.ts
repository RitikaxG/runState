import axios from "axios";
import { describe, it, expect } from "bun:test";
import { BACKEND_NODE_URL } from "./config";
import { generateUrls } from "./admin_list_delete_users.test";


describe("RBAC - Website Ownership", () =>{
    let userAToken : string;
    let userBToken : string;
    let websiteIdA : string;
    it("signin user A", async() =>{
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/signin`,{
            email : "ritikag@gmail.com",
            password : "A@a123456"
        })

        userAToken = res.data.data.access_token;
    })

    it("signin user B", async () => {
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/signin`,{
            email : "ritikagg1@gmail.com",
            password : "A@a123456"
        })

        userBToken = res.data.data.access_token;
    })

    it("user A creates website",async () =>{
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/websites`,{
            url : generateUrls()
        },{
            headers : {
                Authorization : `Bearer ${userAToken}`
            }
        })
        console.log(res.data.data);
        websiteIdA = res.data.data.ID || res.data.data.id;
    })

    it("user B cannot delete user A website", async () => {
        expect.assertions(1)
        try {
            await axios.delete(`${BACKEND_NODE_URL}/api/v1/websites/${websiteIdA}`,{
                headers : {
                    Authorization : `Bearer ${userBToken}`
                }
            })
        }
        catch(err : any){
            expect(err.response.status).toBe(403)
        }
    })
    
    it("user A can delete its own website", async () => {
        const res = await axios.delete(`${BACKEND_NODE_URL}/api/v1/websites/${websiteIdA}`, {
            headers : {
                Authorization : `Bearer ${userAToken}`
            }
        })

        expect(res.data.success).toBe(true)
    })

})