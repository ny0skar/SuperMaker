import { Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import { FREE_MAX_STORES } from "@supermaker/shared";
import type { ApiResponse } from "@supermaker/shared";

const createStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
});

export async function createStore(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  if (req.effectivePlan === "FREE") {
    const count = await prisma.store.count({
      where: { userId: req.userId },
    });
    if (count >= FREE_MAX_STORES) {
      res.status(403).json({
        success: false,
        error: `Free plan allows maximum ${FREE_MAX_STORES} store. Upgrade to Premium for unlimited stores.`,
      } satisfies ApiResponse);
      return;
    }
  }

  const store = await prisma.store.create({
    data: {
      name: parsed.data.name,
      userId: req.userId!,
    },
  });

  res.status(201).json({
    success: true,
    data: store,
  } satisfies ApiResponse);
}

export async function getStores(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const stores = await prisma.store.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    success: true,
    data: stores,
  } satisfies ApiResponse);
}

export async function updateStore(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const store = await prisma.store.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!store) {
    res
      .status(404)
      .json({ success: false, error: "Store not found" } satisfies ApiResponse);
    return;
  }

  const updated = await prisma.store.update({
    where: { id: req.params.id },
    data: { name: parsed.data.name },
  });

  res.json({
    success: true,
    data: updated,
  } satisfies ApiResponse);
}

export async function deleteStore(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const store = await prisma.store.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });

  if (!store) {
    res
      .status(404)
      .json({ success: false, error: "Store not found" } satisfies ApiResponse);
    return;
  }

  await prisma.store.delete({ where: { id: req.params.id } });

  res.json({ success: true } satisfies ApiResponse);
}
