import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { Room } from "../models/Room";
import { redis, redisKeys } from "../config/redis";

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, avatar, memberIds = [] } = req.body as {
      name: string;
      avatar?: string;
      memberIds?: string[];
    };
    const members = Array.from(new Set([userId, ...memberIds]));
    const room = await Room.create({
      name,
      type: "group",
      avatar,
      members,
      admins: [userId],
      inviteCode: randomUUID().slice(0, 8),
    });
    res.status(201).json(room);
  } catch {
    res.status(500).json({ message: "Create room failed" });
  }
};

export const getMyRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const rooms = await Room.find({ members: userId })
      .populate("lastMessage")
      .populate("members", "_id name email avatar")
      .sort({ updatedAt: -1 });

    const enriched = await Promise.all(
      rooms.map(async (room) => {
        const unreadCount = Number(await redis.hget(redisKeys.unread(userId), room._id.toString())) || 0;
        return { ...room.toObject(), unreadCount };
      })
    );
    res.json(enriched);
  } catch {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

export const createOrGetDM = async (req: Request, res: Response): Promise<void> => {
  try {
    const me = req.user!.id;
    const other = String(req.params.userId);

    let room = await Room.findOne({
      type: "direct",
      members: { $all: [me, other], $size: 2 },
    }).populate("lastMessage");

    if (!room) {
      const created = await Room.create({
        name: "Direct Message",
        type: "direct",
        members: [me, other],
        admins: [me],
      });
      room = await Room.findById(created._id).populate("lastMessage");
    }

    res.status(201).json(room);
  } catch {
    res.status(500).json({ message: "Failed to start DM" });
  }
};

export const inviteToRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const room = await Room.findById(String(req.params.id));
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    res.json({ inviteCode: room.inviteCode });
  } catch {
    res.status(500).json({ message: "Invite generation failed" });
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user!.id;
    const roomId = String(req.params.id);
    const userId = String(req.params.userId);
    const room = await Room.findById(roomId);
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
  } catch {
    res.status(500).json({ message: "Remove member failed" });
  }
};
