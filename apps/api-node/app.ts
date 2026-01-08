import express from "express";
import websiteRouter from "./routes/websites";
import userRouter from "./routes/users";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import { errorMiddleware } from "./middlewares/error.middleware";
import { rateLimitMiddleware } from "./middlewares/rateLimit.middleware";

export const app = express();
app.use(express.json());

app.use(rateLimitMiddleware); // 1st 

app.use("/api/v1/websites",websiteRouter);
app.use("/api/v1",userRouter);
app.use("/api/v1/auth",authRouter);
app.use("/api/v1/admin",adminRouter);

app.use(errorMiddleware); // should be last middleware


