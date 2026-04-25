"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const subscriptionSchema = new mongoose_1.Schema({
    endpoint: { type: String, required: true },
    keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
    },
}, { _id: false });
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String },
    refreshToken: { type: String },
    subscriptions: { type: [subscriptionSchema], default: [] },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
