import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Strict limiter for admin/user login attempts
export const limitLogin = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: "Too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Very strict limiter for password reset requests
export const limitPasswordReset = devBypass(rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: "Too many password reset requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict limiter for forgot password requests
export const limitForgotPassword = devBypass(rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: "Too many forgot password requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for session verification
export const limitSessionVerify = devBypass(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 attempts per 5 minutes
  message: "Too many session verification attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));
