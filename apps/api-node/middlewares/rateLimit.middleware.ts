import rateLimit from "express-rate-limit";
import { AppError } from "../utils/appError";

export const rateLimitMiddleware = rateLimit({
    windowMs : 15 * 60 * 1000, //15 min
    max : 100, // max 100 req per IP per window
    standardHeaders : true,
    legacyHeaders : false,

    handler : ( req, res , next ) => {
        return next(new AppError("Too many request please try again",429));
    }
})