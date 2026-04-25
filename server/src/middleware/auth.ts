import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/tokens";

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
