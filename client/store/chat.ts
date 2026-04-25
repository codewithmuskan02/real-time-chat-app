"use client";

import { create } from "zustand";
import { api } from "@/lib/api";
import { Message, Room } from "@/types";

interface ChatState {
  rooms: Room[];
  activeRoomId: string | null;
  messagesByRoom: Record<string, Message[]>;
  unreadTotal: number;
  fetchRooms: () => Promise<void>;
  fetchMessages: (roomId: string, page?: number) => Promise<void>;
  sendMessageOptimistic: (roomId: string, msg: Message) => void;
  upsertMessage: (roomId: string, msg: Message) => void;
  setActiveRoom: (roomId: string) => void;
  fetchUnreadSummary: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  activeRoomId: null,
  messagesByRoom: {},
  unreadTotal: 0,
  fetchRooms: async () => {
    const { data } = await api.get("/api/rooms");
    set({ rooms: data });
  },
  fetchMessages: async (roomId, page = 1) => {
    const { data } = await api.get(`/api/messages/${roomId}?page=${page}&limit=30`);
    const existing = get().messagesByRoom[roomId] ?? [];
    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: page === 1 ? data.items : [...data.items, ...existing],
      },
    });
  },
  sendMessageOptimistic: (roomId, msg) => {
    const existing = get().messagesByRoom[roomId] ?? [];
    set({
      messagesByRoom: { ...get().messagesByRoom, [roomId]: [...existing, msg] },
    });
  },
  upsertMessage: (roomId, msg) => {
    const existing = get().messagesByRoom[roomId] ?? [];
    const has = existing.some((m) => m._id === msg._id);
    set({
      messagesByRoom: {
        ...get().messagesByRoom,
        [roomId]: has ? existing.map((m) => (m._id === msg._id ? msg : m)) : [...existing, msg],
      },
    });
  },
  setActiveRoom: (roomId) => set({ activeRoomId: roomId }),
  fetchUnreadSummary: async () => {
    const { data } = await api.get("/api/notifications/unread");
    set({ unreadTotal: data.total });
  },
}));
