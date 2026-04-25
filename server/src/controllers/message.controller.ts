import { Request, Response } from "express";
import { Message } from "../models/Message";
import { redis, redisKeys } from "../config/redis";

export const getRoomMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const roomId = String(req.params.roomId);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 30);
    const skip = (page - 1) * limit;

    const messages = await Message.find({ room: roomId })
      .populate("sender", "_id name avatar email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      limit,
      items: messages.reverse(),
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const markRoomRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const roomId = String(req.params.roomId);
    await Message.updateMany(
      { room: roomId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );
    await redis.hset(redisKeys.unread(userId), roomId, "0");
    res.json({ message: "Room marked read" });
  } catch {
    res.status(500).json({ message: "Failed to mark read" });
  }
};
