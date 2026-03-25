import { Response } from "express";
import { prisma } from "../utils/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import type { ApiResponse } from "@supermaker/shared";

export async function getMonthlySpending(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const visits = await prisma.visit.findMany({
    where: {
      userId: req.userId,
      status: "FINISHED",
      finishedAt: { gte: sixMonthsAgo },
    },
    select: { total: true, finishedAt: true },
  });

  const monthlyMap = new Map<string, number>();

  for (const visit of visits) {
    if (!visit.finishedAt) continue;
    const date = new Date(visit.finishedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = monthlyMap.get(key) ?? 0;
    monthlyMap.set(key, current + Number(visit.total));
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const data = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, total]) => {
      const [year, month] = key.split("-");
      return {
        month: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
        total: Math.round(total * 100) / 100,
      };
    });

  res.json({ success: true, data } satisfies ApiResponse);
}

export async function getVisitHistory(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const [visits, totalCount] = await Promise.all([
    prisma.visit.findMany({
      where: { userId: req.userId, status: "FINISHED" },
      include: {
        store: { select: { name: true } },
        items: { select: { id: true } },
      },
      orderBy: { finishedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.visit.count({
      where: { userId: req.userId, status: "FINISHED" },
    }),
  ]);

  const data = {
    visits: visits.map((v) => ({
      id: v.id,
      storeName: v.store.name,
      total: Number(v.total),
      itemCount: v.items.length,
      finishedAt: v.finishedAt?.toISOString() ?? null,
    })),
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };

  res.json({ success: true, data } satisfies ApiResponse);
}

export async function getExpiringItems(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const now = new Date();

  const items = await prisma.visitItem.findMany({
    where: {
      visit: {
        userId: req.userId,
        status: "FINISHED",
      },
      expiresAt: { gt: now },
    },
    include: {
      visit: {
        select: { store: { select: { name: true } } },
      },
    },
    orderBy: { expiresAt: "asc" },
  });

  const data = items.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: Number(item.quantity),
    unit: item.unit,
    expiresAt: item.expiresAt!.toISOString(),
    storeName: item.visit.store.name,
  }));

  res.json({ success: true, data } satisfies ApiResponse);
}

export async function getDashboardSummary(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonthVisits, lastMonthVisits, thisMonthItems] = await Promise.all([
    prisma.visit.findMany({
      where: {
        userId: req.userId,
        status: "FINISHED",
        finishedAt: { gte: startOfThisMonth },
      },
      include: {
        store: { select: { name: true } },
        items: { select: { id: true } },
      },
    }),
    prisma.visit.findMany({
      where: {
        userId: req.userId,
        status: "FINISHED",
        finishedAt: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
      select: { total: true },
    }),
    prisma.visitItem.count({
      where: {
        visit: {
          userId: req.userId,
          status: "FINISHED",
          finishedAt: { gte: startOfThisMonth },
        },
      },
    }),
  ]);

  const totalSpentThisMonth = thisMonthVisits.reduce(
    (sum, v) => sum + Number(v.total),
    0,
  );
  const totalSpentLastMonth = lastMonthVisits.reduce(
    (sum, v) => sum + Number(v.total),
    0,
  );

  const percentChange =
    totalSpentLastMonth === 0
      ? totalSpentThisMonth > 0
        ? 100
        : 0
      : Math.round(
          ((totalSpentThisMonth - totalSpentLastMonth) / totalSpentLastMonth) *
            10000,
        ) / 100;

  // Find most visited store this month
  const storeCounts = new Map<string, number>();
  for (const visit of thisMonthVisits) {
    const name = visit.store.name;
    storeCounts.set(name, (storeCounts.get(name) ?? 0) + 1);
  }

  let mostVisitedStore: { name: string; count: number } | null = null;
  for (const [name, count] of storeCounts) {
    if (!mostVisitedStore || count > mostVisitedStore.count) {
      mostVisitedStore = { name, count };
    }
  }

  const data = {
    totalSpentThisMonth: Math.round(totalSpentThisMonth * 100) / 100,
    totalSpentLastMonth: Math.round(totalSpentLastMonth * 100) / 100,
    percentChange,
    totalVisitsThisMonth: thisMonthVisits.length,
    mostVisitedStore,
    totalItemsThisMonth: thisMonthItems,
  };

  res.json({ success: true, data } satisfies ApiResponse);
}
