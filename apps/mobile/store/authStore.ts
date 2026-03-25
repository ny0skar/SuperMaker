import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import api from "../services/api";

interface UserPublic {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  locale: string;
  plan: "FREE" | "PREMIUM";
  planExpiresAt: string | null;
  createdAt: string;
}

interface AuthState {
  user: UserPublic | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserPublic>) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const res = await api.get("/auth/me");
      set({
        user: res.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, tokens } = res.data.data;

    await SecureStore.setItemAsync("accessToken", tokens.accessToken);
    await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);

    set({ user, isAuthenticated: true });
  },

  register: async (email, password, displayName) => {
    const res = await api.post("/auth/register", {
      email,
      password,
      displayName,
    });
    const { user, tokens } = res.data.data;

    await SecureStore.setItemAsync("accessToken", tokens.accessToken);
    await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);

    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...data } });
    }
  },

  refreshUser: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.data });
    } catch {
      // ignore
    }
  },
}));
