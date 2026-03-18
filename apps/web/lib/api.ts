import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const api = axios.create({
    baseURL : API_BASE_URL,
    headers : {
        "Content-Type":"application/json"
    }
})


type RequestOptions = {
    method? : "GET" | "POST" | "DELETE",
    body? : unknown,
    token? : string | null
}

export async function apiRequest<T> (
    path : string,
    options : RequestOptions = {}
): Promise<T> {
    const { method = "GET", body, token } = options;

    try {
        // axios.request() is the general form that works for any HTTP method
        const res = await api.request<T>({
            url: path,
            method,
            data: body,
            headers: {
                ...(token ? { Authorization: `Bearer ${token}`}:{})
            }
        })
        return res.data
    }
    catch(error : any){
        throw new Error(
            error?.response?.data?.error || "Something went wrong"
        )
    }
}