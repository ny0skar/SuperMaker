export type Plan = "FREE" | "PREMIUM";
export type VisitStatus = "ACTIVE" | "FINISHED";
export type Unit = "PIECE" | "KG" | "G" | "L" | "ML";

export interface UserPublic {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  plan: Plan;
  planExpiresAt: string | null;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface Visit {
  id: string;
  userId: string;
  storeId: string;
  status: VisitStatus;
  total: string;
  ticketUrl: string | null;
  createdAt: string;
  finishedAt: string | null;
  store?: Store;
  items?: VisitItem[];
}

export interface VisitItem {
  id: string;
  visitId: string;
  name: string;
  pricePerUnit: string;
  quantity: string;
  unit: Unit;
  subtotal: string;
  expiresAt: string | null;
  barcode: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserPublic;
  tokens: AuthTokens;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateStoreInput {
  name: string;
}

export interface CreateVisitInput {
  storeId: string;
}

export interface CreateVisitItemInput {
  name: string;
  pricePerUnit: number;
  quantity: number;
  unit?: Unit;
  expiresAt?: string;
  barcode?: string;
}

export interface UpdateVisitItemInput {
  name?: string;
  pricePerUnit?: number;
  quantity?: number;
  unit?: Unit;
  expiresAt?: string | null;
  barcode?: string | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
  locale?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
