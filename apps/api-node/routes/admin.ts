import { userController } from "../controllers/user.controller";
import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoleMiddleware } from "../middlewares/rbac.middleware";
import { Role } from "@repo/db/client";

const adminRouter = Router();

// 1. Authentication Required
adminRouter.use(authMiddleware);

// 2. Authorization ( Admin only )
adminRouter.use(requireRoleMiddleware(Role.ADMIN))

adminRouter.get("/users",userController.listUsers);

export default adminRouter;