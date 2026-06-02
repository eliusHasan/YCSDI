import { Router } from "express";
import { CourseController } from "../controllers/course.controller.js";
import { InstituteController } from "../controllers/institute.controller.js";

const router = Router();

router.get("/courses", CourseController.publicList);
router.get("/courses/:slug", CourseController.publicGetBySlug);
router.get("/institutes", InstituteController.publicList);

export { router as publicRoutes };
