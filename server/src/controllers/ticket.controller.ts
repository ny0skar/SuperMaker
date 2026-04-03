import { Response } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import { scanTicketImages, TicketItem } from "../services/ticketScanner.js";
import type { ApiResponse } from "@supermaker/shared";

const scanSchema = z.object({
  images: z.array(z.string()).min(1).max(2),
});

const reconcileSchema = z.object({
  updates: z.array(
    z.object({
      itemId: z.string().uuid(),
      ticketPrice: z.number().positive().optional(),
      category: z.string().max(100).optional(),
    }),
  ),
});

/** Scan ticket images and return extracted data with reconciliation */
export async function scanTicket(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  // Only paid plans
  if (req.effectivePlan === "FREE") {
    res.status(403).json({
      success: false,
      error: "Premium or Family plan required for ticket scanning",
    } satisfies ApiResponse);
    return;
  }

  const parsed = scanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const visit = await prisma.visit.findFirst({
    where: { id: req.params.id, userId: req.userId, status: "FINISHED" },
    include: { items: true, store: true },
  });

  if (!visit) {
    res.status(404).json({
      success: false,
      error: "Finished visit not found",
    } satisfies ApiResponse);
    return;
  }

  try {
    const ticketData = await scanTicketImages(parsed.data.images);

    // Match ticket items to visit items
    const reconciliation = matchItems(visit.items, ticketData.items);

    res.json({
      success: true,
      data: {
        ticket: {
          store: ticketData.store,
          date: ticketData.date,
          total: ticketData.total,
        },
        reconciliation,
        unmatched: ticketData.items.filter(
          (ti) => !reconciliation.some((r) => r.ticketItem?.name === ti.name),
        ),
      },
    } satisfies ApiResponse);
  } catch (err: any) {
    console.error("[TICKET] Scan failed:", err.message);
    res.status(500).json({
      success: false,
      error: "Could not process the ticket. Please try with a clearer photo.",
    } satisfies ApiResponse);
  }
}

/** Apply reconciliation: update prices and categories */
export async function reconcileTicket(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  if (req.effectivePlan === "FREE") {
    res.status(403).json({
      success: false,
      error: "Premium or Family plan required",
    } satisfies ApiResponse);
    return;
  }

  const parsed = reconcileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: parsed.error.errors[0].message,
    } satisfies ApiResponse);
    return;
  }

  const visit = await prisma.visit.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: { items: true },
  });

  if (!visit) {
    res.status(404).json({
      success: false,
      error: "Visit not found",
    } satisfies ApiResponse);
    return;
  }

  // Apply updates in a transaction
  const validItemIds = new Set(visit.items.map((i) => i.id));

  const updates = parsed.data.updates.filter((u) => validItemIds.has(u.itemId));

  await prisma.$transaction(
    updates.map((u) =>
      prisma.visitItem.update({
        where: { id: u.itemId },
        data: {
          ...(u.ticketPrice !== undefined ? { ticketPrice: u.ticketPrice } : {}),
          ...(u.category !== undefined ? { category: u.category } : {}),
        },
      }),
    ),
  );

  const updated = await prisma.visit.findFirst({
    where: { id: visit.id },
    include: { items: true, store: true },
  });

  res.json({ success: true, data: updated } satisfies ApiResponse);
}

/** Match visit items to ticket items using fuzzy name comparison */
function matchItems(
  visitItems: Array<{
    id: string;
    name: string;
    pricePerUnit: any;
    quantity: any;
    subtotal: any;
    category: string | null;
  }>,
  ticketItems: TicketItem[],
) {
  const results: Array<{
    visitItem: { id: string; name: string; userPrice: number; quantity: number };
    ticketItem: TicketItem | null;
    priceDiff: number | null;
    suggestedCategory: string | null;
  }> = [];

  const usedTicketItems = new Set<number>();

  for (const vi of visitItems) {
    const viName = normalize(vi.name);
    let bestMatch: { index: number; score: number } | null = null;

    for (let i = 0; i < ticketItems.length; i++) {
      if (usedTicketItems.has(i)) continue;
      const tiName = normalize(ticketItems[i].name);
      const score = similarity(viName, tiName);
      if (score > 0.3 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { index: i, score };
      }
    }

    const userPrice = Number(vi.subtotal);
    const quantity = Number(vi.quantity);

    if (bestMatch) {
      usedTicketItems.add(bestMatch.index);
      const ti = ticketItems[bestMatch.index];
      results.push({
        visitItem: { id: vi.id, name: vi.name, userPrice, quantity },
        ticketItem: ti,
        priceDiff: ti.total - userPrice,
        suggestedCategory: ti.category,
      });
    } else {
      results.push({
        visitItem: { id: vi.id, name: vi.name, userPrice, quantity },
        ticketItem: null,
        priceDiff: null,
        suggestedCategory: null,
      });
    }
  }

  return results;
}

/** Normalize string for comparison */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/** Simple word-overlap similarity score (0-1) */
function similarity(a: string, b: string): number {
  const wordsA = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const wordsB = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let matches = 0;
  for (const w of wordsA) {
    for (const wb of wordsB) {
      if (w.includes(wb) || wb.includes(w)) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(wordsA.size, wordsB.size);
}
