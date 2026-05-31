import { Router } from "express";
import { CertificateController } from "../controllers/certificate.controller.js";

const router = Router();

router.get("/", CertificateController.list);
router.post("/", CertificateController.create);
router.delete("/:id", CertificateController.remove);

export { router as certificateRoutes };
