import { Response, NextFunction } from "express";
import { prisma } from "../utils/prisma.js";
import { AuthRequest } from "./auth.js";
import type { ApiResponse } from "@supermaker/shared";

const FREEZE_GRACE_DAYS = 30;

/**
 * Runs on every authenticated request to handle family group freeze/unfreeze/delete.
 * Must run AFTER authMiddleware.
 */
export async function familyFreezeCheck(
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.familyGroupId) {
    next();
    return;
  }

  const group = await prisma.familyGroup.findUnique({
    where: { id: req.familyGroupId },
    select: { id: true, ownerId: true, frozenAt: true },
  });

  if (!group) {
    next();
    return;
  }

  const isOwner = group.ownerId === req.userId;

  // Owner downgraded: freeze the group
  if (isOwner && req.userPlan !== "FAMILY" && !group.frozenAt) {
    await prisma.familyGroup.update({
      where: { id: group.id },
      data: { frozenAt: new Date() },
    });
    console.log(`[FAMILY] Group ${group.id} frozen — owner downgraded`);
  }

  // Owner re-upgraded: unfreeze the group
  if (isOwner && req.userPlan === "FAMILY" && group.frozenAt) {
    await prisma.familyGroup.update({
      where: { id: group.id },
      data: { frozenAt: null },
    });
    console.log(`[FAMILY] Group ${group.id} unfrozen — owner re-upgraded`);
  }

  // Check if freeze grace period expired → delete group
  if (group.frozenAt) {
    const daysFrozen = (Date.now() - group.frozenAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysFrozen > FREEZE_GRACE_DAYS) {
      await prisma.familyGroup.delete({ where: { id: group.id } });
      req.familyGroupId = undefined;
      req.effectivePlan = req.userPlan;
      console.log(`[FAMILY] Group ${group.id} deleted — frozen for ${Math.round(daysFrozen)} days`);
    }
  }

  next();
}

/**
 * Middleware that blocks write operations on frozen groups.
 * Use on endpoints that modify family data (invites, wishlist add/update).
 */
export function rejectIfFrozen(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.familyGroupId) {
    next();
    return;
  }

  // We need to check frozenAt — do an async check
  prisma.familyGroup
    .findUnique({
      where: { id: req.familyGroupId },
      select: { frozenAt: true },
    })
    .then((group) => {
      if (group?.frozenAt) {
        res.status(403).json({
          success: false,
          error: "Family group is frozen. The owner needs to renew the Family plan.",
        } satisfies ApiResponse);
        return;
      }
      next();
    })
    .catch(() => next());
}
