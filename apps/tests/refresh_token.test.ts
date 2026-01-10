import { describe, it, expect } from "bun:test";
import axios from "axios";
import { BACKEND_NODE_URL } from "./config";

describe("AUTH - Refresh Token Flow", () => {
    let accessToken : string;
    let refreshToken : string;
    let newAccessToken : string;
    let newRefreshToken : string;

    it("signin user and receive token pair", async () => {
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/signin`,{
            email : "ritikag@gmail.com",
            password : "A@a123456",
        })

        console.log(res.data.data);
        accessToken = res.data.data.access_token;
        refreshToken = res.data.data.refresh_token;

        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
    })

    it("refresh token should return new token pair", async () => {
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/auth/refresh`,{
            refresh_token : refreshToken,
        })

        console.log(res.data.data);
        newAccessToken = res.data.data.access_token;
        newRefreshToken = res.data.data.refresh_token;

        expect(newAccessToken).toBeDefined();
        expect(newRefreshToken).toBeDefined();
    })

    it("old refresh token should be invalid after rotation", async () => {
        expect.assertions(1);
        try{
            await axios.post(`${BACKEND_NODE_URL}/api/v1/auth/refresh`,{
                refresh_token: refreshToken,
            })
        }
        catch(err : any){
            expect(err.response.status).toBe(401)
        }
    })

    it("logout should revoke refresh token", async () => {
        const res = await axios.post(`${BACKEND_NODE_URL}/api/v1/auth/logout`,{
            refresh_token : newRefreshToken,
        })

        expect(res.data.success).toBe(true)
    })

    it("revoked refresh token should not work", async () => {
        expect.assertions(1);
        try{
            await axios.post(`${BACKEND_NODE_URL}/api/v1/auth/refresh`,{
                refresh_token : newRefreshToken,
            })
        }
        catch(err : any){
            expect(err.response.status).toBe(401)
        }
    })

})