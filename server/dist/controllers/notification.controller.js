"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadSummary = exports.savePushSubscription = void 0;
const User_1 = require("../models/User");
const redis_1 = require("../config/redis");
const savePushSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const subscription = req.body;
        const user = await User_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const exists = user.subscriptions.some((s) => s.endpoint === subscription.endpoint);
        if (!exists) {
            user.subscriptions.push(subscription);
            await user.save();
        }
        res.status(201).json({ message: "Subscription saved" });
    }
    catch {
        res.status(500).json({ message: "Failed to save subscription" });
    }
};
exports.savePushSubscription = savePushSubscription;
const getUnreadSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await redis_1.redis.hgetall(redis_1.redisKeys.unread(userId));
        const total = Object.values(data).reduce((acc, val) => acc + Number(val), 0);
        res.json({ total, byRoom: data });
    }
    catch {
        res.status(500).json({ message: "Failed to get unread summary" });
    }
};
exports.getUnreadSummary = getUnreadSummary;
