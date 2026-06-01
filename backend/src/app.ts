import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { requireAuth, requireRole } from "./middleware/auth.middleware.js";
import { adminStudentRoutes } from "./routes/admin.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { certificateRoutes } from "./routes/certificate.routes.js";
import { courseRoutes } from "./routes/course.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { instituteRoutes } from "./routes/institute.routes.js";
import { publicRoutes } from "./routes/public.routes.js";
import { staffRoutes } from "./routes/staff.routes.js";
import { staffStudentRoutes } from "./routes/staff-student.routes.js";
import { studentRoutes } from "./routes/student.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/public", publicRoutes);
  app.use("/api/v1/students", studentRoutes);
  app.use("/api/v1/admin", requireAuth, requireRole("admin"));
  app.use("/api/v1/admin/students", adminStudentRoutes);
  app.use("/api/v1/admin/institutes", instituteRoutes);
  app.use("/api/v1/admin/staff", staffRoutes);
  app.use("/api/v1/admin/courses", courseRoutes);
  app.use("/api/v1/admin/certificates", certificateRoutes);

  app.use("/api/v1/staff", requireAuth, requireRole("staff"));
  app.use("/api/v1/staff/students", staffStudentRoutes);

  return app;
}
