import { create } from "zustand";
import api from "../services/api";

interface Store {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

interface VisitItem {
  id: string;
  visitId: string;
  name: string;
  pricePerUnit: string;
  quantity: string;
  unit: "PIECE" | "KG" | "G" | "L" | "ML";
  subtotal: string;
  expiresAt: string | null;
  barcode: string | null;
  createdAt: string;
}

interface Visit {
  id: string;
  userId: string;
  storeId: string;
  status: "ACTIVE" | "FINISHED";
  total: string;
  createdAt: string;
  finishedAt: string | null;
  store?: Store;
  items?: VisitItem[];
}

interface VisitState {
  stores: Store[];
  activeVisit: Visit | null;
  isLoading: boolean;

  fetchStores: () => Promise<void>;
  createStore: (name: string) => Promise<Store>;
  deleteStore: (id: string) => Promise<void>;

  startVisit: (storeId: string) => Promise<void>;
  fetchActiveVisit: () => Promise<void>;
  addItem: (data: {
    name: string;
    pricePerUnit: number;
    quantity: number;
    unit?: string;
  }) => Promise<void>;
  updateItem: (
    itemId: string,
    data: { quantity?: number; pricePerUnit?: number },
  ) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  finishVisit: () => Promise<void>;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  stores: [],
  activeVisit: null,
  isLoading: false,

  fetchStores: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/stores");
      set({ stores: res.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  createStore: async (name) => {
    const res = await api.post("/stores", { name });
    const store = res.data.data;
    set((s) => ({ stores: [store, ...s.stores] }));
    return store;
  },

  deleteStore: async (id) => {
    await api.delete(`/stores/${id}`);
    set((s) => ({ stores: s.stores.filter((st) => st.id !== id) }));
  },

  startVisit: async (storeId) => {
    const res = await api.post("/visits", { storeId });
    set({ activeVisit: res.data.data });
  },

  fetchActiveVisit: async () => {
    try {
      const res = await api.get("/visits");
      const visits = res.data.data as Visit[];
      const active = visits.find((v) => v.status === "ACTIVE");

      if (active) {
        const detail = await api.get(`/visits/${active.id}`);
        set({ activeVisit: detail.data.data });
      } else {
        set({ activeVisit: null });
      }
    } catch {
      set({ activeVisit: null });
    }
  },

  addItem: async (data) => {
    const visit = get().activeVisit;
    if (!visit) return;

    await api.post(`/visits/${visit.id}/items`, data);
    // Refresh visit to get updated total and items
    const res = await api.get(`/visits/${visit.id}`);
    set({ activeVisit: res.data.data });
  },

  updateItem: async (itemId, data) => {
    const visit = get().activeVisit;
    if (!visit) return;

    await api.put(`/visits/${visit.id}/items/${itemId}`, data);
    const res = await api.get(`/visits/${visit.id}`);
    set({ activeVisit: res.data.data });
  },

  deleteItem: async (itemId) => {
    const visit = get().activeVisit;
    if (!visit) return;

    await api.delete(`/visits/${visit.id}/items/${itemId}`);
    const res = await api.get(`/visits/${visit.id}`);
    set({ activeVisit: res.data.data });
  },

  finishVisit: async () => {
    const visit = get().activeVisit;
    if (!visit) return;

    await api.post(`/visits/${visit.id}/finish`);
    set({ activeVisit: null });
  },
}));
