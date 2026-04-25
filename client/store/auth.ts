"use client";

import { create } from "zustand";
import { api, setAccessToken } from "@/lib/api";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { name: string; email: string; password: string; avatar?: string }) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setAccessToken(data.accessToken);
      set({ user: data.user, token: data.accessToken });
    } finally {
      set({ loading: false });
    }
  },
  signup: async (payload) => {
    set({ loading: true });
    try {
      const { data } = await api.post("/api/auth/signup", payload);
      setAccessToken(data.accessToken);
      set({ user: data.user, token: data.accessToken });
    } finally {
      set({ loading: false });
    }
  },
  logout: async () => {
    await api.post("/api/auth/logout");
    setAccessToken(null);
    set({ user: null, token: null });
  },
  restore: async () => {
    if (get().token) return;
    set({ loading: true });
    try {
      const { data } = await api.post("/api/auth/refresh");
      setAccessToken(data.accessToken);
      const meRes = await api.get("/api/auth/me");
      set({ token: data.accessToken, user: meRes.data });
    } catch {
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  },
}));
