import { Router } from "express";
import { StaffStudentController } from "../controllers/staff-student.controller.js";

const router = Router();

router.get("/", StaffStudentController.list);
router.get("/:serial", StaffStudentController.getBySerial);
router.patch("/:serial", StaffStudentController.patch);

export { router as staffStudentRoutes };
