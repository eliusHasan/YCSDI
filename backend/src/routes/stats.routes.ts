import { Router } from "express";
import { StatsController } from "../controllers/stats.controller.js";

const adminStats = Router();
adminStats.get("/", StatsController.admin);

const staffStats = Router();
staffStats.get("/", StatsController.staff);

export { adminStats as adminStatsRoutes, staffStats as staffStatsRoutes };
