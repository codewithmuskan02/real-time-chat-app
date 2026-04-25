"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = require("mongoose");
const roomSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["direct", "group"], required: true },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true }],
    admins: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User", default: [] }],
    avatar: { type: String },
    inviteCode: { type: String, index: true, unique: true, sparse: true },
    lastMessage: { type: mongoose_1.Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });
exports.Room = (0, mongoose_1.model)("Room", roomSchema);
