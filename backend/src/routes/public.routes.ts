import { Router } from "express";
import { CourseController } from "../controllers/course.controller.js";

const router = Router();

router.get("/courses", CourseController.publicList);
router.get("/courses/:slug", CourseController.publicGetBySlug);

export { router as publicRoutes };
