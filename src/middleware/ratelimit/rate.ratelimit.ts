import rateLimit from "express-rate-limit";

// Limiter for viewing exchange rates
export const limitRateView = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per 5 minutes
  message: "Too many rate view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
