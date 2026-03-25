import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);
router.post("/me/change-password", authMiddleware, changePassword);

export default router;
