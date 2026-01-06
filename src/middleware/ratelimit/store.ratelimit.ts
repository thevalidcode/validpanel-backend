import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Strict limiter for store creation
export const limitStoreCreate = devBypass(
  rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 store creations per hour
  message: "Too many store creation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Limiter for store updates
export const limitStoreUpdate = devBypass(
  rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // 15 updates per 10 minutes
  message: "Too many store update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Strict limiter for store deletion
export const limitStoreDelete = devBypass(
  rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 deletions per 30 minutes
  message: "Too many store deletion attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Limiter for viewing stores
export const limitStoreView = devBypass(
  rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: "Too many store view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Limiter for admin store management actions (approve, pause, etc.)
export const limitStoreAdminAction = devBypass(
  rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 actions per 10 minutes
  message: "Too many admin actions. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);
