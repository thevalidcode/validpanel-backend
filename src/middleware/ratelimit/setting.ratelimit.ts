import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Limiter for updating settings (admin only, but still needs protection)
export const limitSettingsUpdate = devBypass(
  rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 updates per 10 minutes
  message: "Too many settings update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Limiter for viewing settings
export const limitSettingsView = devBypass(
  rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: "Too many settings view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);
