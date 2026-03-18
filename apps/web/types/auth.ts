export type User = {
    id : string;
    email : string;
    role? : string
}

export type SignInRequest = {
    email : string,
    password : string
}

export type SignInResponse = {
    success : boolean;
    data? : {
        accessToken : string
        user : User
    };
    error? : string
}