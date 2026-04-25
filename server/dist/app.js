"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const error_1 = require("./middleware/error");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({
    origin: env_1.env.CLIENT_URL,
    credentials: true,
}));
exports.app.use(express_1.default.json({ limit: "10mb" }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});
exports.app.use("/api/auth", auth_routes_1.default);
exports.app.use("/api/users", user_routes_1.default);
exports.app.use("/api/rooms", room_routes_1.default);
exports.app.use("/api/messages", message_routes_1.default);
exports.app.use("/api/upload", upload_routes_1.default);
exports.app.use("/api/notifications", notification_routes_1.default);
exports.app.use(error_1.errorHandler);
