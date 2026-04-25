"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000", {
    auth: { token: `Bearer ${token}` },
    transports: ["websocket"],
  });
  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
