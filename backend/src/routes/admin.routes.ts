import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { upload } from "../config/cloudinary.js";

const router = Router();

router.get("/", AdminController.getAllStudents);
router.post("/:studentId/approve", AdminController.approveStudent);
router.post("/:studentId/reject", AdminController.rejectStudent);
router.post("/:studentId/photo", upload.single("photo"), AdminController.updateStudentPhoto);
router.patch("/:studentId", AdminController.patchStudent);
router.delete("/:studentId", AdminController.deleteStudent);

export { router as adminStudentRoutes };
