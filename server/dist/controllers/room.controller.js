"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.inviteToRoom = exports.createOrGetDM = exports.getMyRooms = exports.createRoom = void 0;
const crypto_1 = require("crypto");
const Room_1 = require("../models/Room");
const redis_1 = require("../config/redis");
const createRoom = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, avatar, memberIds = [] } = req.body;
        const members = Array.from(new Set([userId, ...memberIds]));
        const room = await Room_1.Room.create({
            name,
            type: "group",
            avatar,
            members,
            admins: [userId],
            inviteCode: (0, crypto_1.randomUUID)().slice(0, 8),
        });
        res.status(201).json(room);
    }
    catch {
        res.status(500).json({ message: "Create room failed" });
    }
};
exports.createRoom = createRoom;
const getMyRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const rooms = await Room_1.Room.find({ members: userId })
            .populate("lastMessage")
            .populate("members", "_id name email avatar")
            .sort({ updatedAt: -1 });
        const enriched = await Promise.all(rooms.map(async (room) => {
            const unreadCount = Number(await redis_1.redis.hget(redis_1.redisKeys.unread(userId), room._id.toString())) || 0;
            return { ...room.toObject(), unreadCount };
        }));
        res.json(enriched);
    }
    catch {
        res.status(500).json({ message: "Failed to fetch rooms" });
    }
};
exports.getMyRooms = getMyRooms;
const createOrGetDM = async (req, res) => {
    try {
        const me = req.user.id;
        const other = String(req.params.userId);
        let room = await Room_1.Room.findOne({
            type: "direct",
            members: { $all: [me, other], $size: 2 },
        }).populate("lastMessage");
        if (!room) {
            const created = await Room_1.Room.create({
                name: "Direct Message",
                type: "direct",
                members: [me, other],
                admins: [me],
            });
            room = await Room_1.Room.findById(created._id).populate("lastMessage");
        }
        res.status(201).json(room);
    }
    catch {
        res.status(500).json({ message: "Failed to start DM" });
    }
};
exports.createOrGetDM = createOrGetDM;
const inviteToRoom = async (req, res) => {
    try {
        const room = await Room_1.Room.findById(String(req.params.id));
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        res.json({ inviteCode: room.inviteCode });
    }
    catch {
        res.status(500).json({ message: "Invite generation failed" });
    }
};
exports.inviteToRoom = inviteToRoom;
const removeMember = async (req, res) => {
    try {
        const adminId = req.user.id;
        const roomId = String(req.params.id);
        const userId = String(req.params.userId);
        const room = await Room_1.Room.findById(roomId);
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        if (!room.admins.some((a) => a.toString() === adminId)) {
            res.status(403).json({ message: "Only admins can remove members" });
            return;
        }
        room.members = room.members.filter((m) => m.toString() !== userId);
        await room.save();
        res.json({ message: "Member removed" });
    }
    catch {
        res.status(500).json({ message: "Remove member failed" });
    }
};
exports.removeMember = removeMember;
