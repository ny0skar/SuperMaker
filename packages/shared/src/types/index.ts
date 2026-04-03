export type Plan = "FREE" | "PREMIUM" | "FAMILY";
export type VisitStatus = "ACTIVE" | "FINISHED";
export type Unit = "PIECE" | "KG" | "G" | "L" | "ML";
export type FamilyRole = "OWNER" | "MEMBER";
export type InviteStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
export type WishlistItemStatus = "PENDING" | "IN_CART" | "NO_HAY" | "BOUGHT";

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

// Family types

export interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  owner?: UserPublic;
  members?: FamilyMemberPublic[];
  createdAt: string;
}

export interface FamilyMemberPublic {
  id: string;
  groupId: string;
  userId: string;
  role: FamilyRole;
  joinedAt: string;
  user?: UserPublic;
}

export interface FamilyInvitePublic {
  id: string;
  groupId: string;
  email: string;
  status: InviteStatus;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  group?: { name: string };
}

export interface WishlistItemPublic {
  id: string;
  groupId: string;
  name: string;
  quantity: string;
  unit: Unit;
  note: string | null;
  status: WishlistItemStatus;
  requestedById: string;
  requestedBy?: UserPublic;
  handledById: string | null;
  handledBy?: UserPublic;
  visitId: string | null;
  price: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFamilyInput {
  name: string;
}

export interface InviteMemberInput {
  email: string;
}

export interface RespondInviteInput {
  accept: boolean;
}

export interface AddWishlistItemInput {
  name: string;
  quantity?: number;
  unit?: Unit;
  note?: string;
}

export interface UpdateWishlistStatusInput {
  status: "IN_CART" | "NO_HAY";
  visitId?: string;
  price?: number;
}
