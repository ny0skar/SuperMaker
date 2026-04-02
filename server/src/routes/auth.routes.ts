import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.js";
import { bruteForceCheck } from "../middleware/brute-force.js";

const router = Router();

router.post("/register", register);
router.post("/login", bruteForceCheck, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);
router.post("/me/change-password", authMiddleware, changePassword);

export default router;
