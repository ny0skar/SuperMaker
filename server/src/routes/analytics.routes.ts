import { Router } from "express";
import {
  getMonthlySpending,
  getVisitHistory,
  getExpiringItems,
  getDashboardSummary,
} from "../controllers/analytics.controller.js";
import { authMiddleware, premiumOnly } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);
router.use(premiumOnly);

router.get("/monthly-spending", getMonthlySpending);
router.get("/history", getVisitHistory);
router.get("/expiring-items", getExpiringItems);
router.get("/summary", getDashboardSummary);

export default router;
