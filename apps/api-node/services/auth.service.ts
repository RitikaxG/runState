import { userRepo } from "../repositories/users.repo"
import { generateAccessToken } from "../utils/jwt";
import { generateRefreshToken, hashRefreshToken } from "../utils/refreshToken";
import { refreshTokenRepo } from "../repositories/refresh_tokens.repo";
import { userService } from "./user.service";
import { AppError } from "../utils/appError";

const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 Days

export const authService = {
    signin : async (input : {
        email : string,
        password : string
    }) => {
        // 1. Authenticate User
        const user = await userService.authenticate(input);
          
        const payload = {
            userId : user.id,
            role : user.role
        }

        // 2. Generate Access Token 
        // JWT either returns a string or throws an error, so no need of defining error explicitly
        const accessToken = generateAccessToken(payload);
       
        // 3. Generate Refresh Token
        const refreshToken = generateRefreshToken();

        // 4. Store hashed refresh token
        await refreshTokenRepo.create( {
            userId : user.id,
            tokenHash : hashRefreshToken(refreshToken),
            expiresAt : new Date(Date.now() + 14*24*60*60*1000),
        })

        return {
            access_token : accessToken,
            refresh_token : refreshToken,
            user
        }
    },

    refresh : async (refreshToken : string ) => {

        const tokenHash = hashRefreshToken(refreshToken);

        // 1. Validate Refresh Token
        const storedToken = await refreshTokenRepo.findValid(tokenHash);
        if(!storedToken){
            throw new AppError("Invalid refresh token",401);
        }

        // 2. Revoke old token ( ROTATION )
        await refreshTokenRepo.revoke(tokenHash);

        // 3. Fetch User
        const user = await userRepo.getById(storedToken.userId);
        if(!user){
            throw new Error("No user found");
        }

        const payload = {
            userId : user.id,
            role : user.role
        }

        // 4. Generate new access token
        const accessToken = generateAccessToken(payload);

        // 5. Generate new refresh token
        const newRefreshToken = generateRefreshToken();

        // 6. Store new refresh token
        await refreshTokenRepo.create({
            userId : user.id,
            tokenHash : hashRefreshToken(newRefreshToken),
            expiresAt : new Date(Date.now() + REFRESH_TOKEN_TTL)
        })

        return {
            access_token : accessToken,
            refresh_token : newRefreshToken,
        }
    },

    logout : async (refreshToken : string) => {
        const tokenHash = hashRefreshToken(refreshToken);
        return await refreshTokenRepo.revoke(tokenHash);
    }
}

