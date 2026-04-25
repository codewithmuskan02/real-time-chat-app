import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const signAccessToken = (payload: { id: string; email: string }): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: { id: string; email: string }): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): { id: string; email: string } =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string; email: string };

export const verifyRefreshToken = (token: string): { id: string; email: string } =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string; email: string };
