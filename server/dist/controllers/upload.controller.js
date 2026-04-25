"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUploadSignature = void 0;
const cloudinary_1 = require("../config/cloudinary");
const getUploadSignature = async (req, res) => {
    try {
        const timestamp = Math.round(Date.now() / 1000);
        const folder = "chat-app";
        const signature = cloudinary_1.cloudinary.utils.api_sign_request({ timestamp, folder }, process.env.CLOUDINARY_API_SECRET);
        res.json({
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            timestamp,
            folder,
            signature,
        });
    }
    catch {
        res.status(500).json({ message: "Could not create upload signature" });
    }
};
exports.getUploadSignature = getUploadSignature;
