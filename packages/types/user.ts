export interface User {
    id : string,
    email : string,
    role : "USER" | "ADMIN",
    createdAt : string
}

export interface AuthTokens {
    accessToken : string,
    refreshtoken : string
}