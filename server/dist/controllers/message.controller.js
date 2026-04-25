"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markRoomRead = exports.getRoomMessages = void 0;
const Message_1 = require("../models/Message");
const redis_1 = require("../config/redis");
const getRoomMessages = async (req, res) => {
    try {
        const roomId = String(req.params.roomId);
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 30);
        const skip = (page - 1) * limit;
        const messages = await Message_1.Message.find({ room: roomId })
            .populate("sender", "_id name avatar email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.json({
            page,
            limit,
            items: messages.reverse(),
        });
    }
    catch {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};
exports.getRoomMessages = getRoomMessages;
const markRoomRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const roomId = String(req.params.roomId);
        await Message_1.Message.updateMany({ room: roomId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } });
        await redis_1.redis.hset(redis_1.redisKeys.unread(userId), roomId, "0");
        res.json({ message: "Room marked read" });
    }
    catch {
        res.status(500).json({ message: "Failed to mark read" });
    }
};
exports.markRoomRead = markRoomRead;
