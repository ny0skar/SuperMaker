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

const router = Router();

router.use(authMiddleware);

router.post("/", createVisit);
router.get("/", getVisits);
router.get("/:id", getVisit);
router.post("/:id/items", addItem);
router.put("/:id/items/:itemId", updateItem);
router.delete("/:id/items/:itemId", deleteItem);
router.post("/:id/finish", finishVisit);

export default router;
