import { Response } from "express";
import { isProd } from "../config/env";

export const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie("refreshToken");
};
