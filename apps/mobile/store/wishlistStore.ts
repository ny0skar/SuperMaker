import { create } from "zustand";
import api from "../services/api";

interface WishlistItem {
  id: string;
  groupId: string;
  name: string;
  quantity: string;
  unit: string;
  note: string | null;
  status: "PENDING" | "IN_CART" | "NO_HAY" | "BOUGHT";
  requestedById: string;
  requestedBy?: { id: string; displayName: string | null; email: string };
  handledById: string | null;
  handledBy?: { id: string; displayName: string | null; email: string };
  visitId: string | null;
  price: string | null;
  createdAt: string;
  updatedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;

  fetchWishlist: (status?: string) => Promise<void>;
  addItem: (data: { name: string; quantity?: number; unit?: string; note?: string }) => Promise<void>;
  markInCart: (itemId: string, visitId: string, price: number) => Promise<void>;
  markNoHay: (itemId: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async (status) => {
    set({ isLoading: true });
    try {
      const params = status ? `?status=${status}` : "";
      const res = await api.get(`/wishlist${params}`);
      set({ items: res.data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (data) => {
    await api.post("/wishlist", data);
    await get().fetchWishlist();
  },

  markInCart: async (itemId, visitId, price) => {
    await api.patch(`/wishlist/${itemId}/status`, {
      status: "IN_CART",
      visitId,
      price,
    });
    await get().fetchWishlist();
  },

  markNoHay: async (itemId) => {
    await api.patch(`/wishlist/${itemId}/status`, {
      status: "NO_HAY",
    });
    await get().fetchWishlist();
  },

  deleteItem: async (itemId) => {
    await api.delete(`/wishlist/${itemId}`);
    await get().fetchWishlist();
  },

  reset: () => set({ items: [], isLoading: false }),
}));
