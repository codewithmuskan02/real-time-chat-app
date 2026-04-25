import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import roomRoutes from "./routes/room.routes";
import messageRoutes from "./routes/message.routes";
import uploadRoutes from "./routes/upload.routes";
import notificationRoutes from "./routes/notification.routes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);
