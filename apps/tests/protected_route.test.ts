import axios from "axios";
import { describe, expect, it } from "bun:test";
import { response } from "express";

const BASE_URL = `http://localhost:3001`;

describe('Protected Route', () => { 
 let accessToken : string;
 let refreshToken : string;

 it("signin",async () => {
    const res = await axios.post(`${BASE_URL}/api/v1/signin`,{
        email : "ritika1@gmail.com",
        password : "A@a123456"
    })
    expect(res.data.success).toBe(true);
    expect(res.data.data.refresh_token).toBeDefined();

    accessToken = res.data.data.access_token;
    refreshToken = res.data.data.refresh_token;
 });

 it("fails without token", async () => {
    try{
        const res = await axios.post(`${BASE_URL}/api/v1/websites`,{
            url : "https://example4.com",
        })
    }catch(err : any){
        expect(err.response.status).toBe(401);
    }
 })

//  it("succeeds with token", async () => {
//     const res = await axios.post(`${BASE_URL}/api/v1/websites`,{
//         url : "https://exampleas.com"
//     },{
//         headers : {
//             Authorization : `Bearer ${accessToken}`
//         }
//     })
//     expect(res.data.success).toBe(true);
//     console.log(res.data.data);
//     console.log(res.data.data.id);
//     console.log(res.data.data.ID);
//  })
})