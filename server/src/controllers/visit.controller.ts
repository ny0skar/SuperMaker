import { Response } from "express";
import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../utils/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import { FREE_MAX_ITEMS_PER_VISIT } from "@supermaker/shared";
import type { Visit, VisitItem, ApiResponse } from "@supermaker/shared";

const createVisitSchema = z.object({
  storeId: z.string().uuid("Invalid store ID"),
});

const createItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(200),
  pricePerUnit: z.number().positive("Price must be positive"),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.enum(["PIECE", "KG", "G", "L", "ML"]).optional().default("PIECE"),
  expiresAt: z.string().datetime().optional(),
  barcode: z.string().optional(),
});

const updateItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  pricePerUnit: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  unit: z.enum(["PIECE", "KG", "G", "L", "ML"]).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  barcode: z.string().nullable().optional(),
});

export async function createVisit(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = createVisitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const store = await prisma.store.findFirst({
    where: { id: parsed.data.storeId, userId: req.userId },
  });

  if (!store) {
    res
      .status(404)
      .json({ success: false, error: "Store not found" } satisfies ApiResponse);
    return;
  }

  const visit = await prisma.visit.create({
    data: {
      userId: req.userId!,
      storeId: parsed.data.storeId,
    },
    include: { store: true, items: true },
  });

  res.status(201).json({
    success: true,
    data: visit,
  } satisfies ApiResponse);
}

export async function getVisit(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const visit = await prisma.visit.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { store: true, items: { orderBy: { createdAt: "asc" } } },
  });

  if (!visit) {
    res
      .status(404)
      .json({ success: false, error: "Visit not found" } satisfies ApiResponse);
    return;
  }

  res.json({ success: true, data: visit } satisfies ApiResponse);
}

export async function getVisits(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (req.userPlan === "FREE") {
    // Free users only see active visits (no history)
    const visits = await prisma.visit.findMany({
      where: { userId: req.userId, status: "ACTIVE" },
      include: { store: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: visits } satisfies ApiResponse);
    return;
  }

  const visits = await prisma.visit.findMany({
    where: { userId: req.userId },
    include: { store: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: visits } satisfies ApiResponse);
}

export async function addItem(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = createItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const visit = await prisma.visit.findFirst({
    where: { id: req.params.id, userId: req.userId, status: "ACTIVE" },
    include: { items: true },
  });

  if (!visit) {
    res.status(404).json({
      success: false,
      error: "Active visit not found",
    } satisfies ApiResponse);
    return;
  }

  if (req.userPlan === "FREE" && visit.items.length >= FREE_MAX_ITEMS_PER_VISIT) {
    res.status(403).json({
      success: false,
      error: `Free plan allows maximum ${FREE_MAX_ITEMS_PER_VISIT} items per visit. Upgrade to Premium for unlimited items.`,
    } satisfies ApiResponse);
    return;
  }

  const subtotal = parsed.data.pricePerUnit * parsed.data.quantity;

  const item = await prisma.visitItem.create({
    data: {
      visitId: visit.id,
      name: parsed.data.name,
      pricePerUnit: parsed.data.pricePerUnit,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      subtotal,
      expiresAt: parsed.data.expiresAt
        ? new Date(parsed.data.expiresAt)
        : null,
      barcode: parsed.data.barcode ?? null,
    },
  });

  // Update visit total
  const newTotal = new Decimal(visit.total).plus(new Decimal(subtotal));
  await prisma.visit.update({
    where: { id: visit.id },
    data: { total: newTotal },
  });

  res.status(201).json({
    success: true,
    data: item,
  } satisfies ApiResponse);
}

export async function updateItem(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const parsed = updateItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const visit = await prisma.visit.findFirst({
    where: { id: req.params.id, userId: req.userId, status: "ACTIVE" },
  });

  if (!visit) {
    res.status(404).json({
      success: false,
      error: "Active visit not found",
    } satisfies ApiResponse);
    return;
  }

  const item = await prisma.visitItem.findFirst({
    where: { id: req.params.itemId, visitId: visit.id },
  });

  if (!item) {
    res
      .status(404)
      .json({ success: false, error: "Item not found" } satisfies ApiResponse);
    return;
  }

  const newPrice = parsed.data.pricePerUnit ?? Number(item.pricePerUnit);
  const newQty = parsed.data.quantity ?? Number(item.quantity);
  const newSubtotal = newPrice * newQty;
  const oldSubtotal = Number(item.subtotal);

  const updated = await prisma.visitItem.update({
    where: { id: item.id },
    data: {
      ...parsed.data,
      expiresAt:
        parsed.data.expiresAt === null
          ? null
          : parsed.data.expiresAt
            ? new Date(parsed.data.expiresAt)
            : undefined,
      subtotal: newSubtotal,
    },
  });

  // Update visit total
  const totalDiff = newSubtotal - oldSubtotal;
  const newTotal = new Decimal(visit.total).plus(new Decimal(totalDiff));
  await prisma.visit.update({
    where: { id: visit.id },
    data: { total: newTotal.lessThan(0) ? 0 : newTotal },
  });

  res.json({ success: true, data: updated } satisfies ApiResponse);
}

export async function deleteItem(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const visit = await prisma.visit.findFirst({
    where: { id: req.params.id, userId: req.userId, status: "ACTIVE" },
  });

  if (!visit) {
    res.status(404).json({
      success: false,
      error: "Active visit not found",
    } satisfies ApiResponse);
    return;
  }

  const item = await prisma.visitItem.findFirst({
    where: { id: req.params.itemId, visitId: visit.id },
  });

  if (!item) {
    res
      .status(404)
      .json({ success: false, error: "Item not found" } satisfies ApiResponse);
    return;
  }

  await prisma.visitItem.delete({ where: { id: item.id } });

  // Update visit total
  const newTotal = new Decimal(visit.total).minus(item.subtotal);
  await prisma.visit.update({
    where: { id: visit.id },
    data: { total: newTotal.lessThan(0) ? 0 : newTotal },
  });

  res.json({ success: true } satisfies ApiResponse);
}

export async function finishVisit(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const visit = await prisma.visit.findFirst({
    where: { id: req.params.id, userId: req.userId, status: "ACTIVE" },
    include: { items: true },
  });

  if (!visit) {
    res.status(404).json({
      success: false,
      error: "Active visit not found",
    } satisfies ApiResponse);
    return;
  }

  const updated = await prisma.visit.update({
    where: { id: visit.id },
    data: {
      status: "FINISHED",
      finishedAt: new Date(),
    },
    include: { store: true, items: true },
  });

  // For free users, delete the visit data after finishing (ephemeral)
  if (req.userPlan === "FREE") {
    await prisma.visitItem.deleteMany({ where: { visitId: visit.id } });
    await prisma.visit.delete({ where: { id: visit.id } });
  }

  res.json({ success: true, data: updated } satisfies ApiResponse);
}
