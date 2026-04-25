"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const tokens_1 = require("../utils/tokens");
const redis_1 = require("../config/redis");
const Message_1 = require("../models/Message");
const Room_1 = require("../models/Room");
const getBearerToken = (raw) => {
    if (!raw)
        return null;
    return raw.startsWith("Bearer ") ? raw.slice(7) : raw;
};
const setupSocket = (io) => {
    io.use((socket, next) => {
        try {
            const token = getBearerToken(socket.handshake.auth?.token);
            if (!token)
                return next(new Error("Unauthorized"));
            const payload = (0, tokens_1.verifyAccessToken)(token);
            socket.userId = payload.id;
            next();
        }
        catch {
            next(new Error("Unauthorized"));
        }
    });
    io.on("connection", async (socket) => {
        const userId = socket.userId;
        await redis_1.redis.hset(redis_1.redisKeys.onlineUsers, userId, socket.id);
        io.emit("user:online", { userId });
        const myRooms = await Room_1.Room.find({ members: userId }).select("_id");
        myRooms.forEach((r) => socket.join(r._id.toString()));
        socket.on("message:send", async (payload) => {
            try {
                const { roomId, content, type, fileUrl } = payload;
                const room = await Room_1.Room.findById(roomId);
                if (!room || !room.members.some((m) => m.toString() === userId))
                    return;
                const message = await Message_1.Message.create({
                    room: roomId,
                    sender: userId,
                    content,
                    type,
                    fileUrl,
                    readBy: [userId],
                });
                room.lastMessage = message._id;
                await room.save();
                const fullMessage = await Message_1.Message.findById(message._id).populate("sender", "_id name avatar email");
                io.to(roomId).emit("message:receive", fullMessage);
                await Promise.all(room.members
                    .filter((m) => m.toString() !== userId)
                    .map((memberId) => redis_1.redis.hincrby(redis_1.redisKeys.unread(memberId.toString()), roomId, 1)));
            }
            catch (error) {
                console.error("message:send failed", error);
            }
        });
        socket.on("message:read", async ({ roomId, messageId }) => {
            try {
                await redis_1.redis.hset(redis_1.redisKeys.unread(userId), roomId, "0");
                if (messageId) {
                    const message = await Message_1.Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } }, { new: true });
                    if (!message)
                        return;
                    io.to(roomId).emit("message:read:update", {
                        messageId: message._id,
                        readBy: message.readBy,
                    });
                }
            }
            catch (error) {
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
            await redis_1.redis.hdel(redis_1.redisKeys.onlineUsers, userId);
            io.emit("user:offline", { userId });
        });
    });
};
exports.setupSocket = setupSocket;
