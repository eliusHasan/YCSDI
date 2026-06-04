import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { requireAuth, requireRole } from "./middleware/auth.middleware.js";
import { adminStudentRoutes } from "./routes/admin.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { courseRoutes } from "./routes/course.routes.js";
import { documentRoutes } from "./routes/documents.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { instituteRoutes } from "./routes/institute.routes.js";
import { publicRoutes } from "./routes/public.routes.js";
import { adminStatsRoutes, staffStatsRoutes } from "./routes/stats.routes.js";
import { staffRoutes } from "./routes/staff.routes.js";
import { staffStudentRoutes } from "./routes/staff-student.routes.js";
import { studentRoutes } from "./routes/student.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(compression());
  const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const netlifyPreviewHosts = allowedOrigins
    .map((o) => {
      try {
        return new URL(o).hostname;
      } catch {
        return null;
      }
    })
    .filter((h): h is string => !!h && h.endsWith(".netlify.app"));

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        try {
          const host = new URL(origin).hostname;
          if (netlifyPreviewHosts.some((h) => host.endsWith(`--${h}`) || host === h)) {
            return callback(null, true);
          }
        } catch {
          // fall through
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
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
  app.use("/api/v1/admin/stats", adminStatsRoutes);
  app.use("/api/v1/admin/students", adminStudentRoutes);
  app.use("/api/v1/admin/institutes", instituteRoutes);
  app.use("/api/v1/admin/staff", staffRoutes);
  app.use("/api/v1/admin/courses", courseRoutes);
  app.use("/api/v1/admin/documents", documentRoutes);

  app.use("/api/v1/staff", requireAuth, requireRole("staff"));
  app.use("/api/v1/staff/stats", staffStatsRoutes);
  app.use("/api/v1/staff/students", staffStudentRoutes);

  return app;
}
