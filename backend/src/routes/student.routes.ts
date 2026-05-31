import { Router } from "express";
import { upload } from "../config/cloudinary.js";
import { RegistrationController } from "../controllers/registration.controller.js";
import { StudentController } from "../controllers/student.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", upload.single("photo"), RegistrationController.registerStudent);
router.get("/me", requireAuth, requireRole("student"), StudentController.me);

export { router as studentRoutes };
