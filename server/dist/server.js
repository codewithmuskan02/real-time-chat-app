"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const socket_1 = require("./socket");
const bootstrap = async () => {
    await (0, db_1.connectDB)();
    const httpServer = (0, http_1.createServer)(app_1.app);
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: env_1.env.CLIENT_URL, credentials: true },
    });
    (0, socket_1.setupSocket)(io);
    httpServer.listen(Number(env_1.env.PORT), () => {
        console.log(`Server running on port ${env_1.env.PORT}`);
    });
};
bootstrap().catch((error) => {
    console.error("Failed to bootstrap server", error);
    process.exit(1);
});
