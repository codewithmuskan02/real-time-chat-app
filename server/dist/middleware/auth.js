"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const tokens_1 = require("../utils/tokens");
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
        if (!token) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        req.user = (0, tokens_1.verifyAccessToken)(token);
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.requireAuth = requireAuth;
