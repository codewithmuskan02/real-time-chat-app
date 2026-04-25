"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    content: { type: String, default: "" },
    type: { type: String, enum: ["text", "image", "file"], required: true },
    fileUrl: { type: String },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    room: { type: mongoose_1.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
}, { timestamps: true });
messageSchema.index({ room: 1, createdAt: -1 });
exports.Message = (0, mongoose_1.model)("Message", messageSchema);
