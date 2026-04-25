"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.string().default("development"),
    PORT: zod_1.z.string().default("5000"),
    MONGO_URI: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    REDIS_URL: zod_1.z.string().min(1),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1),
    CLIENT_URL: zod_1.z.string().default("http://localhost:3000"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    throw new Error(`Invalid environment config: ${parsed.error.message}`);
}
exports.env = parsed.data;
exports.isProd = exports.env.NODE_ENV === "production";
