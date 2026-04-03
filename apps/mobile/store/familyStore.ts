import { create } from "zustand";
import api from "../services/api";

interface UserPublic {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  plan: string;
}

interface FamilyMember {
  id: string;
  groupId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
  user?: UserPublic;
}

interface FamilyInvite {
  id: string;
  groupId: string;
  email: string;
  status: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  group?: { name: string; owner?: UserPublic };
}

interface FamilyGroup {
  id: string;
  name: string;
  ownerId: string;
  owner?: UserPublic;
  members?: FamilyMember[];
  invites?: FamilyInvite[];
  createdAt: string;
}

interface FamilyState {
  group: FamilyGroup | null;
  myInvites: FamilyInvite[];
  isLoading: boolean;

  fetchFamily: () => Promise<void>;
  createFamily: (name: string) => Promise<void>;
  sendInvite: (email: string) => Promise<void>;
  fetchMyInvites: () => Promise<void>;
  respondToInvite: (inviteId: string, accept: boolean) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  reset: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  group: null,
  myInvites: [],
  isLoading: false,

  fetchFamily: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get("/family");
      set({ group: res.data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createFamily: async (name) => {
    const res = await api.post("/family", { name });
    set({ group: res.data.data });
  },

  sendInvite: async (email) => {
    await api.post("/family/invites", { email });
    await get().fetchFamily();
  },

  fetchMyInvites: async () => {
    try {
      const res = await api.get("/family/invites");
      set({ myInvites: res.data.data });
    } catch {
      // ignore
    }
  },

  respondToInvite: async (inviteId, accept) => {
    await api.post(`/family/invites/${inviteId}/respond`, { accept });
    await get().fetchMyInvites();
    await get().fetchFamily();
  },

  removeMember: async (memberId) => {
    await api.delete(`/family/members/${memberId}`);
    await get().fetchFamily();
  },

  leaveFamily: async () => {
    await api.post("/family/leave");
    set({ group: null });
  },

  reset: () => set({ group: null, myInvites: [], isLoading: false }),
}));
