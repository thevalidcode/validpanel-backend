import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Limiter for viewing email logs
export const limitEmailLogView = devBypass(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requests per 5 minutes
  message: "Too many email log view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for replying to emails
export const limitEmailReply = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 replies per 10 minutes
  message: "Too many email reply attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for deleting email logs
export const limitEmailLogDelete = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 deletions per 10 minutes
  message: "Too many email log deletion attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));
