import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", AuthController.login);
router.get("/me", requireAuth, AuthController.me);

export { router as authRoutes };
