"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import ChatWindow from "@/components/ChatWindow";

export default function DMPage() {
  const { userId } = useParams<{ userId: string }>();
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const { data } = await api.post(`/api/rooms/dm/${userId}`);
      setRoomId(data._id);
      await api.post(`/api/messages/${data._id}/read`);
    };
    void bootstrap();
  }, [userId]);

  if (!roomId) return <div className="grid flex-1 place-content-center text-zinc-400">Loading chat...</div>;
  return <ChatWindow roomId={roomId} />;
}
