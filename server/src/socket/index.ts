import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/tokens";
import { redis, redisKeys } from "../config/redis";
import { Message } from "../models/Message";
import { Room } from "../models/Room";

type AuthedSocket = Socket & { userId?: string };

const getBearerToken = (raw?: string): string | null => {
  if (!raw) return null;
  return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
};

export const setupSocket = (io: Server): void => {
  io.use((socket, next) => {
    try {
      const token = getBearerToken(socket.handshake.auth?.token);
      if (!token) return next(new Error("Unauthorized"));
      const payload = verifyAccessToken(token);
      (socket as AuthedSocket).userId = payload.id;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket: AuthedSocket) => {
    const userId = socket.userId!;
    await redis.hset(redisKeys.onlineUsers, userId, socket.id);
    io.emit("user:online", { userId });

    const myRooms = await Room.find({ members: userId }).select("_id");
    myRooms.forEach((r) => socket.join(r._id.toString()));

    socket.on("message:send", async (payload) => {
      try {
        const { roomId, content, type, fileUrl } = payload;
        const room = await Room.findById(roomId);
        if (!room || !room.members.some((m) => m.toString() === userId)) return;

        const message = await Message.create({
          room: roomId,
          sender: userId,
          content,
          type,
          fileUrl,
          readBy: [userId],
        });
        room.lastMessage = message._id as any;
        await room.save();

        const fullMessage = await Message.findById(message._id).populate(
          "sender",
          "_id name avatar email"
        );
        io.to(roomId).emit("message:receive", fullMessage);

        await Promise.all(
          room.members
            .filter((m) => m.toString() !== userId)
            .map((memberId) => redis.hincrby(redisKeys.unread(memberId.toString()), roomId, 1))
        );
      } catch (error) {
        console.error("message:send failed", error);
      }
    });

    socket.on("message:read", async ({ roomId, messageId }) => {
      try {
        await redis.hset(redisKeys.unread(userId), roomId, "0");
        if (messageId) {
          const message = await Message.findByIdAndUpdate(
            messageId,
            { $addToSet: { readBy: userId } },
            { new: true }
          );
          if (!message) return;
          io.to(roomId).emit("message:read:update", {
            messageId: message._id,
            readBy: message.readBy,
          });
        }
      } catch (error) {
        console.error("message:read failed", error);
      }
    });

    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:update", { roomId, userId, isTyping: true });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:update", { roomId, userId, isTyping: false });
    });

    socket.on("disconnect", async () => {
      await redis.hdel(redisKeys.onlineUsers, userId);
      io.emit("user:offline", { userId });
    });
  });
};
