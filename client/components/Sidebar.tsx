"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useChatStore } from "@/store/chat";

export default function Sidebar() {
  const rooms = useChatStore((s) => s.rooms);
  const fetchRooms = useChatStore((s) => s.fetchRooms);

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  return (
    <aside className="w-full border-r border-zinc-800 md:w-80">
      <div className="border-b border-zinc-800 p-3 font-semibold">Chats</div>
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
        {rooms.map((room) => (
          <Link
            key={room._id}
            href={room.type === "direct" ? `/chat/dm/${room.members[0]?.id ?? ""}` : `/chat/room/${room._id}`}
            className="block border-b border-zinc-900 px-3 py-2 hover:bg-zinc-900"
          >
            <p className="text-sm font-medium">{room.name}</p>
            <p className="truncate text-xs text-zinc-400">{room.lastMessage?.content ?? "No messages yet"}</p>
          </Link>
        ))}
      </div>
    </aside>
  );
}
