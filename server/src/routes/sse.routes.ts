import { Router } from "express";
import { subscribeToFamily } from "../controllers/sse.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/family/events", authMiddleware, subscribeToFamily);

export default router;
