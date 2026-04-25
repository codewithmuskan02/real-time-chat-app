"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useChatStore } from "@/store/chat";
import { useAuthStore } from "@/store/auth";
import { User } from "@/types";

const getUserId = (user?: Partial<User>): string => String(user?.id ?? user?._id ?? "");

export default function Sidebar() {
  const router = useRouter();
  const rooms = useChatStore((s) => s.rooms);
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const me = useAuthStore((s) => s.user);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showDmModal, setShowDmModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomAvatar, setRoomAvatar] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [dmQuery, setDmQuery] = useState("");
  const [dmResults, setDmResults] = useState<User[]>([]);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [startingDm, setStartingDm] = useState(false);
  const [searchingMembers, setSearchingMembers] = useState(false);
  const [searchingDmUsers, setSearchingDmUsers] = useState(false);

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  const myId = getUserId(me ?? undefined);

  const searchUsers = async (
    query: string,
    setResults: (users: User[]) => void,
    setSearching: (value: boolean) => void
  ) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    try {
      setSearching(true);
      const { data } = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setResults(data);
    } catch {
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void searchUsers(memberQuery, setMemberResults, setSearchingMembers);
    }, 350);
    return () => clearTimeout(timeout);
  }, [memberQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void searchUsers(dmQuery, setDmResults, setSearchingDmUsers);
    }, 350);
    return () => clearTimeout(timeout);
  }, [dmQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (showCreateRoomModal) {
          setShowCreateRoomModal(false);
          resetCreateRoomForm();
        }
        if (showDmModal) {
          setShowDmModal(false);
          setDmQuery("");
          setDmResults([]);
        }
      }

      if (event.key === "Enter") {
        if (showCreateRoomModal && !creatingRoom) {
          event.preventDefault();
          void createRoom();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCreateRoomModal, showDmModal, creatingRoom, roomName, roomAvatar, selectedMembers]);

  const resetCreateRoomForm = () => {
    setRoomName("");
    setRoomAvatar("");
    setMemberQuery("");
    setMemberResults([]);
    setSelectedMembers([]);
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      toast.error("Room name is required");
      return;
    }
    try {
      setCreatingRoom(true);
      await api.post("/api/rooms", {
        name: roomName,
        avatar: roomAvatar || undefined,
        memberIds: selectedMembers.map((m) => getUserId(m)),
      });
      await fetchRooms();
      resetCreateRoomForm();
      setShowCreateRoomModal(false);
      toast.success("Room created");
    } catch {
      toast.error("Could not create room");
    } finally {
      setCreatingRoom(false);
    }
  };

  const startDm = async (userId: string) => {
    try {
      setStartingDm(true);
      await api.post(`/api/rooms/dm/${userId}`);
      await fetchRooms();
      setShowDmModal(false);
      setDmQuery("");
      setDmResults([]);
      router.push(`/chat/dm/${userId}`);
      toast.success("DM started");
    } catch {
      toast.error("Could not start DM");
    } finally {
      setStartingDm(false);
    }
  };

  const roomHref = (room: (typeof rooms)[number]) => {
    if (room.type === "group") return `/chat/room/${room._id}`;
    const otherMember = room.members.find((member) => getUserId(member) !== myId) ?? room.members[0];
    return `/chat/dm/${getUserId(otherMember)}`;
  };

  return (
    <aside className="w-full border-r border-zinc-800 md:w-80">
      <div className="space-y-2 border-b border-zinc-800 p-3">
        <p className="font-semibold">Chats</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowCreateRoomModal(true);
              setShowDmModal(false);
            }}
            className="rounded bg-zinc-800 px-2 py-1 text-xs"
          >
            Create Room
          </button>
          <button
            onClick={() => {
              setShowDmModal(true);
              setShowCreateRoomModal(false);
            }}
            className="rounded bg-zinc-800 px-2 py-1 text-xs"
          >
            Start DM
          </button>
        </div>
      </div>
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto">
        {rooms.map((room) => (
          <Link
            key={room._id}
            href={roomHref(room)}
            className="block border-b border-zinc-900 px-3 py-2 hover:bg-zinc-900"
          >
            <p className="text-sm font-medium">{room.name}</p>
            <p className="truncate text-xs text-zinc-400">{room.lastMessage?.content ?? "No messages yet"}</p>
          </Link>
        ))}
      </div>
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md space-y-3 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Create Group Room</h2>
              <button
                onClick={() => {
                  setShowCreateRoomModal(false);
                  resetCreateRoomForm();
                }}
                className="text-xs text-zinc-400"
              >
                Close
              </button>
            </div>
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              placeholder="Room avatar URL (optional)"
              value={roomAvatar}
              onChange={(e) => setRoomAvatar(e.target.value)}
            />
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              placeholder="Search users to add members"
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
            />
            {searchingMembers && <p className="text-[11px] text-zinc-400">Searching...</p>}
            <div className="max-h-32 space-y-1 overflow-y-auto">
              {memberResults.map((user) => {
                const id = getUserId(user);
                const exists = selectedMembers.some((m) => getUserId(m) === id);
                return (
                  <button
                    type="button"
                    key={id}
                    disabled={exists}
                    onClick={() => setSelectedMembers((prev) => [...prev, user])}
                    className="block w-full rounded bg-zinc-950 px-2 py-1 text-left text-xs disabled:opacity-50"
                  >
                    {user.name} ({user.email})
                  </button>
                );
              })}
              {!searchingMembers && memberQuery.trim() && memberResults.length === 0 && (
                <p className="rounded bg-zinc-950 px-2 py-1 text-[11px] text-zinc-400">No users found.</p>
              )}
            </div>
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedMembers.map((user) => (
                  <button
                    key={getUserId(user)}
                    type="button"
                    onClick={() =>
                      setSelectedMembers((prev) => prev.filter((m) => getUserId(m) !== getUserId(user)))
                    }
                    className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-[11px]"
                  >
                    {user.name} ×
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => void createRoom()}
              disabled={creatingRoom}
              className="w-full rounded bg-blue-600 px-3 py-1.5 text-xs font-medium"
            >
              {creatingRoom ? "Creating..." : "Create Room"}
            </button>
          </div>
        </div>
      )}
      {showDmModal && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md space-y-3 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Start Direct Message</h2>
              <button
                onClick={() => {
                  setShowDmModal(false);
                  setDmQuery("");
                  setDmResults([]);
                }}
                className="text-xs text-zinc-400"
              >
                Close
              </button>
            </div>
            <input
              className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-xs"
              placeholder="Search users by name"
              value={dmQuery}
              onChange={(e) => setDmQuery(e.target.value)}
            />
            {searchingDmUsers && <p className="text-[11px] text-zinc-400">Searching...</p>}
            <div className="max-h-44 space-y-1 overflow-y-auto">
              {dmResults.map((user) => (
                <button
                  type="button"
                  key={getUserId(user)}
                  onClick={() => void startDm(getUserId(user))}
                  disabled={startingDm}
                  className="block w-full rounded bg-zinc-950 px-2 py-1 text-left text-xs hover:bg-zinc-800 disabled:opacity-70"
                >
                  {user.name} ({user.email})
                </button>
              ))}
              {!searchingDmUsers && dmQuery.trim() && dmResults.length === 0 && (
                <p className="rounded bg-zinc-950 px-2 py-1 text-[11px] text-zinc-400">No users found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
