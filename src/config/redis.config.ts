import Redis from "ioredis";
import { env } from "./env.config";

const redisUrl = env.REDIS_URL || "redis://127.0.0.1:6379";

// Create Redis instance
export const redis = new Redis(redisUrl);

// Handle connection errors
redis.on("error", (err) => {
  console.error("❌ Redis error:", err);
});