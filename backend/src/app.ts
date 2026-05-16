import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.routes.js";

export function createApp() {
  const app = express();

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

  return app;
}
