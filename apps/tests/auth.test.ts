import axios from "axios";
import { describe, expect, it } from "bun:test";

const BASE_URL = `http://localhost:3001`;

describe("Signup Signin User",()=>{
    // it("Signup - Create a user",async () => {
    //     const res = await axios.post(`${BASE_URL}/api/v1/signup`,{
    //         email : "ritikagg1@gmail.com",
    //         password : "A@a123456"
    //     })

    //     expect(res.data.success).toBe(true);
    //     expect(res.data.data.email).toBe("ritikagg1@gmail.com");
    // })
    it("Signin - Return JWT",async ()=>{
        const res = await axios.post(`${BASE_URL}/api/v1/signin`,{
            email : "ritika11@gmail.com",
            password : "A@a123456"
        })

        expect(res.data.data).toBeDefined();
    })
})