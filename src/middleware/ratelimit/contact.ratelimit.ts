import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Strict limiter for creating contact messages (public endpoint)
export const limitContactMessageCreate = devBypass(rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 messages per hour per IP
  message: "Too many contact messages from this IP. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for admin viewing contact messages
export const limitContactMessageView = devBypass(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requests per 5 minutes
  message: "Too many contact message view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for admin updating contact message status
export const limitContactMessageUpdate = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // 50 updates per 10 minutes
  message: "Too many contact message update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict limiter for deleting contact messages
export const limitContactMessageDelete = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20, // 20 deletions per 30 minutes
  message: "Too many contact message deletion attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));
