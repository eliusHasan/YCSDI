import { Router } from "express";
import { courseImageUpload } from "../config/cloudinary.js";
import { CourseController } from "../controllers/course.controller.js";

const router = Router();

router.get("/", CourseController.list);
router.get("/:id", CourseController.get);
router.post("/", courseImageUpload.single("image"), CourseController.create);
router.patch("/:id", courseImageUpload.single("image"), CourseController.update);
router.delete("/:id", CourseController.remove);

export { router as courseRoutes };
