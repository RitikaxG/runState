import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { signinSchema, signupSchema } from "@repo/schemas";

export const userRouter = Router();


userRouter.post("/signup",validateMiddleware(signupSchema), userController.signup);
userRouter.post("/signin",validateMiddleware(signinSchema), userController.signin);

export default userRouter;