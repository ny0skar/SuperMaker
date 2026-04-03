import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../utils/prisma.js";

export interface AuthRequest extends Request {
  userId?: string;
  userPlan?: "FREE" | "PREMIUM" | "FAMILY";
  /** Effective plan after resolving family membership */
  effectivePlan?: "FREE" | "PREMIUM" | "FAMILY";
  familyGroupId?: string;
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

    // Resolve effective plan: a FREE user in a family group gets FAMILY features
    if (user.plan === "FREE" || user.plan === "PREMIUM") {
      const membership = await prisma.familyMember.findFirst({
        where: { userId: user.id },
        select: { groupId: true },
      });
      if (membership) {
        req.effectivePlan = "FAMILY";
        req.familyGroupId = membership.groupId;
      } else {
        req.effectivePlan = user.plan;
      }
    } else {
      req.effectivePlan = user.plan;
      // Owner's group
      const group = await prisma.familyGroup.findFirst({
        where: { ownerId: user.id },
        select: { id: true },
      });
      if (group) req.familyGroupId = group.id;
    }

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
  if (req.effectivePlan === "FREE") {
    res
      .status(403)
      .json({ success: false, error: "Premium subscription required" });
    return;
  }
  next();
}

export function familyOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (req.effectivePlan !== "FAMILY") {
    res
      .status(403)
      .json({ success: false, error: "Family plan required" });
    return;
  }
  next();
}
