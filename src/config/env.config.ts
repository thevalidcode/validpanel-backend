import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Schema for validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("2340"),
  MASTER_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  SESSION_SECRET: z.string().min(1),
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  BACKEND_PROXY_PATH: z.string().optional().default(""),
  REDIS_URL: z.string().optional().default(""),
  CORE_SERVICE_SECRET: z.string().default(""),
  GOOGLE_CLIENT_ID: z.string().min(1),
  RATE_KEY: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  SOCIAL_MEDIA_STORE_BACKEND_URL: z.string().min(1).url(),
  SHOP_BACKEND_URL: z.string().min(1).url(),
  DIGITAL_BACKEND_URL: z.string().min(1).url(),
});

// Parse env
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;
