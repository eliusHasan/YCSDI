import { Router } from "express";
import { InstituteController } from "../controllers/institute.controller.js";

const router = Router();

router.get("/", InstituteController.list);
router.get("/:id", InstituteController.get);
router.post("/", InstituteController.create);
router.patch("/:id", InstituteController.update);
router.delete("/:id", InstituteController.remove);

export { router as instituteRoutes };
