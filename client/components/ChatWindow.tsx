"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chat";
import { connectSocket, getSocket } from "@/lib/socket";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { Message } from "@/types";

interface Props {
  roomId: string;
}

export default function ChatWindow({ roomId }: Props) {
  const { token, user } = useAuthStore();
  const messages = useChatStore((s) => s.messagesByRoom[roomId] ?? []);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const upsertMessage = useChatStore((s) => s.upsertMessage);
  const sendMessageOptimistic = useChatStore((s) => s.sendMessageOptimistic);
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchMessages(roomId, 1);
  }, [roomId, fetchMessages]);

  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    socket.emit("message:read", { roomId });
    socket.emit("typing:stop", { roomId });
    socket.on("message:receive", (message: Message) => {
      if (message.room !== roomId) return;
      upsertMessage(roomId, message);
      socket.emit("message:read", { roomId, messageId: message._id });
      if (document.hidden && Notification.permission === "granted") {
        new Notification(message.sender?.name ?? "New message", {
          body: message.content || "Sent an attachment",
        });
      }
    });
    socket.on("message:read:update", ({ messageId, readBy }) => {
      const target = messages.find((m) => m._id === messageId);
      if (!target) return;
      upsertMessage(roomId, { ...target, readBy });
    });
    return () => {
      socket.off("message:receive");
      socket.off("message:read:update");
    };
  }, [roomId, token, upsertMessage, messages]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  const send = (payload: { content: string; type: "text" | "image" | "file"; fileUrl?: string }) => {
    if (!user) return;
    const optimistic: Message = {
      _id: crypto.randomUUID(),
      content: payload.content,
      type: payload.type,
      fileUrl: payload.fileUrl,
      sender: user,
      room: roomId,
      readBy: [user.id],
      createdAt: new Date().toISOString(),
    };
    sendMessageOptimistic(roomId, optimistic);
    getSocket()?.emit("message:send", { roomId, ...payload });
  };

  return (
    <section className="flex h-full flex-1 flex-col">
      <div
        ref={listRef}
        className="flex-1 space-y-2 overflow-y-auto p-3"
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollTop === 0) {
            const next = page + 1;
            setPage(next);
            void fetchMessages(roomId, next);
          }
        }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} mine={msg.sender?.id === user?.id} />
        ))}
      </div>
      <MessageInput onSend={send} />
    </section>
  );
}
