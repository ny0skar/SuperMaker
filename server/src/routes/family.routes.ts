import { Router } from "express";
import {
  createFamily,
  getMyFamily,
  inviteMember,
  getMyInvites,
  respondToInvite,
  removeMember,
  leaveFamily,
} from "../controllers/family.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";
import { familyFreezeCheck, rejectIfFrozen } from "../middleware/family-freeze.js";

const router = Router();

router.use(authMiddleware);
router.use(familyFreezeCheck);

router.post("/", createFamily);
router.get("/", getMyFamily);
router.post("/invites", rejectIfFrozen, inviteMember);
router.get("/invites", getMyInvites);
router.post("/invites/:id/respond", validateUuidParam("id"), respondToInvite);
router.delete("/members/:id", validateUuidParam("id"), removeMember);
router.post("/leave", leaveFamily);

export default router;
