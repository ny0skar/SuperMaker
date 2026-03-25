import { Router } from "express";
import {
  createStore,
  getStores,
  updateStore,
  deleteStore,
} from "../controllers/store.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/", createStore);
router.get("/", getStores);
router.put("/:id", updateStore);
router.delete("/:id", deleteStore);

export default router;
