import { Router } from "express";
import { scanTicket, reconcileTicket } from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

const router = Router();

router.use(authMiddleware);

router.post("/:id/scan-ticket", validateUuidParam("id"), scanTicket);
router.post("/:id/reconcile", validateUuidParam("id"), reconcileTicket);

export default router;
