import { authController } from "../controllers/auth.controller";
import { Router } from "express";

const authRouter = Router();
authRouter.post("/refresh",authController.refresh);
authRouter.post("/logout",authController.logout);

export default authRouter;