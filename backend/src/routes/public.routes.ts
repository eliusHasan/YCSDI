import { Router } from "express";
import { CourseController } from "../controllers/course.controller.js";
import { InstituteController } from "../controllers/institute.controller.js";
import { VerificationController } from "../controllers/verification.controller.js";

const router = Router();

router.get("/courses", CourseController.publicList);
router.get("/courses/:slug", CourseController.publicGetBySlug);
router.get("/institutes", InstituteController.publicList);
router.get("/verify/:serial", VerificationController.verify);
router.get("/result", VerificationController.result);

export { router as publicRoutes };
