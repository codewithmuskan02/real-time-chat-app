"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chat";

export default function NotificationBell() {
  const unreadTotal = useChatStore((s) => s.unreadTotal);
  const fetchUnreadSummary = useChatStore((s) => s.fetchUnreadSummary);

  useEffect(() => {
    void fetchUnreadSummary();
  }, [fetchUnreadSummary]);

  return (
    <div className="relative">
      <button className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm">🔔</button>
      {unreadTotal > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px]">{unreadTotal}</span>
      )}
    </div>
  );
}
