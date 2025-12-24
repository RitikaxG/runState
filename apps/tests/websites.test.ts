import axios from "axios";
import { describe, expect, it } from "bun:test";

const BASE_URL = `http://localhost:3000`;

describe("Website gets created",() => {
    it("Website gets created if url is passed",async ()=>{
        const response = await axios.post(`${BASE_URL}/api/v1/websites`,{
            url : "https://google.com"
        })

        expect(response.data.id).not.toBeNull();
    })
})