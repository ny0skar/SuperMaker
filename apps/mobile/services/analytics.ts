import api from "./api";

export interface MonthlySpending {
  month: string;
  year: number;
  total: number;
}

export interface VisitHistoryItem {
  id: string;
  storeName: string;
  total: string;
  itemCount: number;
  finishedAt: string;
}

export interface VisitHistoryResponse {
  visits: VisitHistoryItem[];
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ExpiringItem {
  id: string;
  name: string;
  storeName: string;
  expiresAt: string;
}

export interface DashboardSummary {
  totalSpentThisMonth: number;
  percentChange: number;
  totalVisits: number;
  mostVisitedStore: string | null;
  recentVisits: VisitHistoryItem[];
}

export async function getMonthlySpending(): Promise<MonthlySpending[]> {
  const res = await api.get("/analytics/monthly-spending");
  return res.data.data;
}

export async function getVisitHistory(
  page?: number,
): Promise<VisitHistoryResponse> {
  const res = await api.get("/analytics/history", {
    params: page ? { page } : undefined,
  });
  return res.data.data;
}

export async function getExpiringItems(): Promise<ExpiringItem[]> {
  const res = await api.get("/analytics/expiring-items");
  return res.data.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get("/analytics/summary");
  return res.data.data;
}
