import rateLimit from "express-rate-limit";

// Limiter for marking notifications as read
export const limitNotificationMarkAsRead = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 mark-as-read actions per 5 minutes
  message: "Too many notification actions. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for viewing notifications
export const limitNotificationView = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: "Too many notification view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
