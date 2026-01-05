import axios from "axios";
import { describe, it, expect } from "bun:test";

const BASE_URL = `http://localhost:3001`;

describe("RBAC - Website Ownership", () =>{
    let userAToken : string;
    let userBToken : string;
    let websiteIdA : string;
    it("signin user A", async() =>{
        const res = await axios.post(`${BASE_URL}/api/v1/signin`,{
            email : "ritika2@gmail.com",
            password : "A@a123456"
        })

        userAToken = res.data.data.access_token;
    })

    it("signin user B", async () => {
        const res = await axios.post(`${BASE_URL}/api/v1/signin`,{
            email : "ritika3@gmail.com",
            password : "A@a123456"
        })

        userBToken = res.data.data.access_token;
    })

    it("user A creates website",async () =>{
        const res = await axios.post(`${BASE_URL}/api/v1/websites`,{
            url : "https://examples1.com"
        },{
            headers : {
                Authorization : `Bearer ${userAToken}`
            }
        })
        console.log(res.data.data);
        websiteIdA = res.data.data.ID;
    })
    it("user B cannot delete user A website", async () => {
        expect.assertions(1)
        try {
            await axios.delete(`${BASE_URL}/api/v1/websites/${websiteIdA}`,{
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
        const res = await axios.delete(`${BASE_URL}/api/v1/websites/${websiteIdA}`, {
            headers : {
                Authorization : `Bearer ${userAToken}`
            }
        })

        expect(res.data.success).toBe(true)
    })

})