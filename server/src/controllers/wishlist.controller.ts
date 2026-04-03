import { Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import type { ApiResponse } from "@supermaker/shared";
import { broadcast } from "../services/familyBroadcast.js";

const addItemSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  quantity: z.number().positive().optional().default(1),
  unit: z.enum(["PIECE", "KG", "G", "L", "ML"]).optional().default("PIECE"),
  note: z.string().max(300).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["IN_CART", "NO_HAY"]),
  visitId: z.string().uuid().optional(),
  price: z.number().positive().optional(),
});

/** Add an item to the family wishlist */
export async function addWishlistItem(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (!req.familyGroupId) {
    res.status(403).json({
      success: false,
      error: "You must belong to a family group",
    } satisfies ApiResponse);
    return;
  }

  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const item = await prisma.wishlistItem.create({
    data: {
      groupId: req.familyGroupId,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      note: parsed.data.note ?? null,
      requestedById: req.userId!,
    },
    include: { requestedBy: { select: userSelect } },
  });

  broadcast(req.familyGroupId, "wishlist:added", item, req.userId);

  res.status(201).json({ success: true, data: item } satisfies ApiResponse);
}

/** Get wishlist items for my family group */
export async function getWishlist(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (!req.familyGroupId) {
    res.status(403).json({
      success: false,
      error: "You must belong to a family group",
    } satisfies ApiResponse);
    return;
  }

  // Filter by status if provided, otherwise show PENDING + NO_HAY (active items)
  const statusParam = req.query.status as string | undefined;
  let statusFilter: string[];

  if (statusParam) {
    statusFilter = statusParam.split(",");
  } else {
    statusFilter = ["PENDING", "NO_HAY"];
  }

  const items = await prisma.wishlistItem.findMany({
    where: {
      groupId: req.familyGroupId,
      status: { in: statusFilter as any },
    },
    include: {
      requestedBy: { select: userSelect },
      handledBy: { select: userSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data: items } satisfies ApiResponse);
}

/** Update wishlist item status (PENDING → IN_CART or NO_HAY) */
export async function updateWishlistItemStatus(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (!req.familyGroupId) {
    res.status(403).json({
      success: false,
      error: "You must belong to a family group",
    } satisfies ApiResponse);
    return;
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const item = await prisma.wishlistItem.findFirst({
    where: { id: req.params.id, groupId: req.familyGroupId },
  });

  if (!item) {
    res.status(404).json({
      success: false,
      error: "Wishlist item not found",
    } satisfies ApiResponse);
    return;
  }

  // Only PENDING items can be transitioned
  if (item.status !== "PENDING") {
    res.status(409).json({
      success: false,
      error: `Cannot change status from ${item.status} to ${parsed.data.status}`,
    } satisfies ApiResponse);
    return;
  }

  if (parsed.data.status === "IN_CART" && !parsed.data.visitId) {
    res.status(400).json({
      success: false,
      error: "visitId is required when marking as IN_CART",
    } satisfies ApiResponse);
    return;
  }

  const updated = await prisma.wishlistItem.update({
    where: { id: item.id },
    data: {
      status: parsed.data.status,
      handledById: req.userId,
      visitId: parsed.data.visitId ?? null,
      price: parsed.data.price ?? null,
    },
    include: {
      requestedBy: { select: userSelect },
      handledBy: { select: userSelect },
    },
  });

  broadcast(req.familyGroupId!, "wishlist:updated", updated, req.userId);

  res.json({ success: true, data: updated } satisfies ApiResponse);
}



/** Delete a wishlist item (requester or group owner) */
export async function deleteWishlistItem(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (!req.familyGroupId) {
    res.status(403).json({
      success: false,
      error: "You must belong to a family group",
    } satisfies ApiResponse);
    return;
  }

  const item = await prisma.wishlistItem.findFirst({
    where: { id: req.params.id, groupId: req.familyGroupId },
  });

  if (!item) {
    res.status(404).json({
      success: false,
      error: "Wishlist item not found",
    } satisfies ApiResponse);
    return;
  }

  // Only the requester or group owner can delete
  const group = await prisma.familyGroup.findUnique({
    where: { id: req.familyGroupId },
  });

  if (item.requestedById !== req.userId && group?.ownerId !== req.userId) {
    res.status(403).json({
      success: false,
      error: "Only the requester or group owner can delete this item",
    } satisfies ApiResponse);
    return;
  }

  await prisma.wishlistItem.delete({ where: { id: item.id } });

  broadcast(req.familyGroupId!, "wishlist:deleted", { id: item.id }, req.userId);

  res.json({ success: true } satisfies ApiResponse);
}

const userSelect = {
  id: true,
  email: true,
  displayName: true,
  avatarUrl: true,
  locale: true,
  plan: true,
  planExpiresAt: true,
  createdAt: true,
} as const;
