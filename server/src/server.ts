import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { setupSocket } from "./socket";

const bootstrap = async (): Promise<void> => {
  await connectDB();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  setupSocket(io);
  httpServer.listen(Number(env.PORT), () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server", error);
  process.exit(1);
});
