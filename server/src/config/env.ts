import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.string().default("5000"),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  REDIS_URL: z.string().min(1),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLIENT_URL: z.string().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid environment config: ${parsed.error.message}`);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
