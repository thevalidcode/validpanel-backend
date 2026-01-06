import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Limiter for viewing orders
export const limitOrderView = devBypass(
  rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per 5 minutes
  message: "Too many order view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);
