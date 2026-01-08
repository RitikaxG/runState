import { Router } from "express";
import { websiteController } from "../controllers/websites.controller";
import { createWebsiteSchema } from "@repo/schemas";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRoleMiddleware } from "../middlewares/rbac.middleware";

export const websiteRouter = Router();

// 1. authMiddleware() : populates req.user
websiteRouter.use(authMiddleware());

// 2. Checks req.user.role ( RBAC )
websiteRouter.use(requireRoleMiddleware("ADMIN","USER"))

websiteRouter.post("/",
    validateMiddleware(createWebsiteSchema), 
    websiteController.create);

websiteRouter.delete("/:id",
    websiteController.delete
)

export default websiteRouter;