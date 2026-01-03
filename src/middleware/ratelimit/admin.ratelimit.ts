import rateLimit from "express-rate-limit";

// Strict limiter for admin creation
export const limitAdminCreate = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 admin creations per 30 minutes
  message: "Too many admin creation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for admin authentication
export const limitAdminAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per 15 minutes
  message: "Too many admin login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for admin password operations
export const limitAdminPasswordOps = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password operations per hour
  message: "Too many password operation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for admin updates and actions
export const limitAdminUpdate = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 updates per 10 minutes
  message: "Too many admin update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for admin deletion
export const limitAdminDelete = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 deletions per 30 minutes
  message: "Too many admin deletion attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for viewing admin data
export const limitAdminView = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: "Too many admin view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for role/permission creation
export const limitRolePermissionCreate = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 creations per 30 minutes
  message: "Too many role/permission creation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for role/permission updates
export const limitRolePermissionUpdate = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 updates per 10 minutes
  message: "Too many role/permission update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for role/permission deletion
export const limitRolePermissionDelete = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 deletions per 30 minutes
  message: "Too many role/permission deletion attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
