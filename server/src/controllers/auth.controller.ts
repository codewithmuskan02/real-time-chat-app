import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { clearRefreshCookie, setRefreshCookie } from "../utils/http";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/tokens";

const sanitizeUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  createdAt: user.createdAt,
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, avatar } = req.body as {
      name: string;
      email: string;
      password: string;
      avatar?: string;
    };

    if (!name || !email || !password) {
      res.status(400).json({ message: "name, email and password are required" });
      return;
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      avatar,
    });

    const payload = { id: user._id.toString(), email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user: sanitizeUser(user), accessToken });
  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const payload = { id: user._id.toString(), email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    user.refreshToken = refreshToken;
    await user.save();
    setRefreshCookie(res, refreshToken);

    res.json({ user: sanitizeUser(user), accessToken });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ message: "Missing refresh token" });
      return;
    }
    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.id);
    if (!user || user.refreshToken !== token) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }
    const accessToken = signAccessToken({ id: user._id.toString(), email: user.email });
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Refresh failed" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken as string | undefined;
    if (token) {
      await User.updateOne({ refreshToken: token }, { $unset: { refreshToken: 1 } });
    }
    clearRefreshCookie(res);
    res.json({ message: "Logged out" });
  } catch {
    res.status(500).json({ message: "Logout failed" });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.id).select("_id name email avatar");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};
