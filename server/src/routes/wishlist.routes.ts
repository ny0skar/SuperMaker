import { Router } from "express";
import {
  addWishlistItem,
  getWishlist,
  updateWishlistItemStatus,
  deleteWishlistItem,
} from "../controllers/wishlist.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateUuidParam } from "../middleware/validate-uuid.js";

const router = Router();

router.use(authMiddleware);

router.post("/", addWishlistItem);
router.get("/", getWishlist);
router.patch("/:id/status", validateUuidParam("id"), updateWishlistItemStatus);
router.delete("/:id", validateUuidParam("id"), deleteWishlistItem);

export default router;
