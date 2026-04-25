import { Request, Response } from "express";
import { cloudinary } from "../config/cloudinary";

export const getUploadSignature = async (req: Request, res: Response): Promise<void> => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "chat-app";
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!
    );

    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature,
    });
  } catch {
    res.status(500).json({ message: "Could not create upload signature" });
  }
};
