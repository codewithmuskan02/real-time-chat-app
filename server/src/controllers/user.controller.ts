import { Request, Response } from "express";
import { User } from "../models/User";
import { redis, redisKeys } from "../config/redis";

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q) {
      res.json([]);
      return;
    }
    const users = await User.find({
      name: { $regex: q, $options: "i" },
      _id: { $ne: req.user!.id },
    })
      .select("_id name email avatar")
      .limit(20);

    const onlineUsers = await redis.hkeys(redisKeys.onlineUsers);
    const onlineSet = new Set(onlineUsers);
    res.json(
      users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        isOnline: onlineSet.has(u._id.toString()),
      }))
    );
  } catch {
    res.status(500).json({ message: "Search failed" });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("_id name email avatar");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const isOnline = Boolean(await redis.hget(redisKeys.onlineUsers, user._id.toString()));
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isOnline,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
