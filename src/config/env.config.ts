import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Schema for validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("2340"),
  MASTER_KEY: z.string().min(1, "MASTER_KEY is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
  ADMIN_USERNAME: z.string().min(1, "ADMIN_USERNAME is required"),
  ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
  AWS_S3_BUCKET: z.string().min(1, "AWS_S3_BUCKET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  AWS_REGION: z.string().min(1, "AWS_REGION is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
  BACKEND_PROXY_PATH: z.string().optional().default(""),
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
