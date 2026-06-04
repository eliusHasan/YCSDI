import { Router } from "express";
import { DocumentController } from "../controllers/document.controller.js";

const router = Router();

// Enrollment / marks management
router.get("/student/:studentId", DocumentController.studentDetail);
router.patch("/enrollment/:enrollmentId", DocumentController.patchEnrollment);

// Issued documents (type ∈ registration | admit | marksheet | certificate)
router.get("/:type", DocumentController.list);
router.post("/:type", DocumentController.issue);
router.post("/:type/:id/regenerate", DocumentController.regenerate);
router.delete("/:type/:id", DocumentController.remove);

export { router as documentRoutes };
