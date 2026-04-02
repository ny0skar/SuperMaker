import { Router } from "express";
import {
  createVisit,
  getVisit,
  getVisits,
  addItem,
  updateItem,
  deleteItem,
  finishVisit,
} from "../controllers/visit.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createVisit);
router.get("/", getVisits);
router.get("/:id", validateUuidParam("id"), getVisit);
router.post("/:id/items", validateUuidParam("id"), addItem);
router.put("/:id/items/:itemId", validateUuidParam("id", "itemId"), updateItem);
router.delete("/:id/items/:itemId", validateUuidParam("id", "itemId"), deleteItem);
router.post("/:id/finish", validateUuidParam("id"), finishVisit);

export default router;
