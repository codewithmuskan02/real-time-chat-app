"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import ChatWindow from "@/components/ChatWindow";

export default function RoomChatPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);

  useEffect(() => {
    setActiveRoom(roomId);
    void api.post(`/api/messages/${roomId}/read`);
  }, [roomId, setActiveRoom]);

  return <ChatWindow roomId={roomId} />;
}
