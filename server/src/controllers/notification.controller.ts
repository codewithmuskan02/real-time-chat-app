import { Request, Response } from "express";
import { User } from "../models/User";
import { redis, redisKeys } from "../config/redis";

export const savePushSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const subscription = req.body;
    const user = await User.findById(userId);
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
  } catch {
    res.status(500).json({ message: "Failed to save subscription" });
  }
};

export const getUnreadSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = await redis.hgetall(redisKeys.unread(userId));
    const total = Object.values(data).reduce((acc, val) => acc + Number(val), 0);
    res.json({ total, byRoom: data });
  } catch {
    res.status(500).json({ message: "Failed to get unread summary" });
  }
};
