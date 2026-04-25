"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.logout = exports.refresh = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const http_1 = require("../utils/http");
const tokens_1 = require("../utils/tokens");
const sanitizeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
});
const signup = async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: "name, email and password are required" });
            return;
        }
        const exists = await User_1.User.findOne({ email: email.toLowerCase() });
        if (exists) {
            res.status(409).json({ message: "Email already in use" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            avatar,
        });
        const payload = { id: user._id.toString(), email: user.email };
        const accessToken = (0, tokens_1.signAccessToken)(payload);
        const refreshToken = (0, tokens_1.signRefreshToken)(payload);
        user.refreshToken = refreshToken;
        await user.save();
        (0, http_1.setRefreshCookie)(res, refreshToken);
        res.status(201).json({ user: sanitizeUser(user), accessToken });
    }
    catch (error) {
        res.status(500).json({ message: "Signup failed" });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid) {
            res.status(401).json({ message: "Invalid credentials" });
            return;
        }
        const payload = { id: user._id.toString(), email: user.email };
        const accessToken = (0, tokens_1.signAccessToken)(payload);
        const refreshToken = (0, tokens_1.signRefreshToken)(payload);
        user.refreshToken = refreshToken;
        await user.save();
        (0, http_1.setRefreshCookie)(res, refreshToken);
        res.json({ user: sanitizeUser(user), accessToken });
    }
    catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401).json({ message: "Missing refresh token" });
            return;
        }
        const payload = (0, tokens_1.verifyRefreshToken)(token);
        const user = await User_1.User.findById(payload.id);
        if (!user || user.refreshToken !== token) {
            res.status(401).json({ message: "Invalid refresh token" });
            return;
        }
        const accessToken = (0, tokens_1.signAccessToken)({ id: user._id.toString(), email: user.email });
        res.json({ accessToken });
    }
    catch {
        res.status(401).json({ message: "Refresh failed" });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            await User_1.User.updateOne({ refreshToken: token }, { $unset: { refreshToken: 1 } });
        }
        (0, http_1.clearRefreshCookie)(res);
        res.json({ message: "Logged out" });
    }
    catch {
        res.status(500).json({ message: "Logout failed" });
    }
};
exports.logout = logout;
const me = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const payload = (0, tokens_1.verifyAccessToken)(token);
        const user = await User_1.User.findById(payload.id).select("_id name email avatar");
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
    }
    catch {
        res.status(401).json({ message: "Unauthorized" });
    }
};
exports.me = me;
