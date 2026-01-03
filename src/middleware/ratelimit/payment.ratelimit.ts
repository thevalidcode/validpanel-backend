import rateLimit from "express-rate-limit";

// Limiter for viewing payment lists (user/admin)
export const limitPaymentView = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per 5 minutes
  message: "Too many payment view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
