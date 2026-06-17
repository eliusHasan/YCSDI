import { Router } from "express";
import { StaffController } from "../controllers/staff.controller.js";

const router = Router();

router.get("/", StaffController.list);
router.get("/:id", StaffController.get);
router.post("/", StaffController.create);
router.patch("/:id", StaffController.update);
router.post("/:id/password", StaffController.resetPassword);
router.delete("/:id", StaffController.remove);

export { router as staffRoutes };
