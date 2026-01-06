import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Strict limiter for admin creation
export const limitAdminCreate = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 admin creations per 30 minutes
  message: "Too many admin creation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict limiter for admin authentication
export const limitAdminAuth = devBypass(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: "Too many admin login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict limiter for admin password operations
export const limitAdminPasswordOps = devBypass(rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password operations per hour
  message: "Too many password operation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for admin updates and actions
export const limitAdminUpdate = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 updates per 10 minutes
  message: "Too many admin update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict limiter for admin deletion
export const limitAdminDelete = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 deletions per 30 minutes
  message: "Too many admin deletion attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for viewing admin data
export const limitAdminView = devBypass(rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: "Too many admin view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict limiter for role/permission creation
export const limitRolePermissionCreate = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 creations per 30 minutes
  message: "Too many role/permission creation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Limiter for role/permission updates
export const limitRolePermissionUpdate = devBypass(rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 updates per 10 minutes
  message: "Too many role/permission update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
}));

// Strict limiter for role/permission deletion
export const limitRolePermissionDelete = devBypass(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 deletions per 30 minutes
  message: "Too many role/permission deletion attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
}));
