"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.searchUsers = void 0;
const User_1 = require("../models/User");
const redis_1 = require("../config/redis");
const searchUsers = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) {
            res.json([]);
            return;
        }
        const users = await User_1.User.find({
            name: { $regex: q, $options: "i" },
            _id: { $ne: req.user.id },
        })
            .select("_id name email avatar")
            .limit(20);
        const onlineUsers = await redis_1.redis.hkeys(redis_1.redisKeys.onlineUsers);
        const onlineSet = new Set(onlineUsers);
        res.json(users.map((u) => ({
            id: u._id,
            name: u.name,
            email: u.email,
            avatar: u.avatar,
            isOnline: onlineSet.has(u._id.toString()),
        })));
    }
    catch {
        res.status(500).json({ message: "Search failed" });
    }
};
exports.searchUsers = searchUsers;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.params.id).select("_id name email avatar");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isOnline = Boolean(await redis_1.redis.hget(redis_1.redisKeys.onlineUsers, user._id.toString()));
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            isOnline,
        });
    }
    catch {
        res.status(500).json({ message: "Failed to fetch user" });
    }
};
exports.getUserById = getUserById;
