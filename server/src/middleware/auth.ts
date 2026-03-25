import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../utils/prisma.js";

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: "FREE" | "PREMIUM";
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Token required" });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, plan: true },
    });

    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }

    req.userId = user.id;
    req.userPlan = user.plan;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

export function premiumOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (req.userPlan !== "PREMIUM") {
    res
      .status(403)
      .json({ success: false, error: "Premium subscription required" });
    return;
  }
  next();
}
