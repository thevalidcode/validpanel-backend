import rateLimit from "express-rate-limit";

// Strict limiter for adding payment gateways
export const limitPaymentGatewayCreate = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 additions per 30 minutes
  message: "Too many payment gateway creation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for updating payment gateways
export const limitPaymentGatewayUpdate = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // 15 updates per 10 minutes
  message: "Too many payment gateway update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for deleting payment gateways
export const limitPaymentGatewayDelete = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // 10 deletions per 30 minutes
  message: "Too many payment gateway deletion attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for viewing payment gateways
export const limitPaymentGatewayView = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per 5 minutes
  message: "Too many payment gateway view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
