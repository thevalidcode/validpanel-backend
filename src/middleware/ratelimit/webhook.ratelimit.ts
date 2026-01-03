import rateLimit from "express-rate-limit";

// Limiter for webhook endpoints (more permissive to avoid blocking legitimate payment provider webhooks)
export const limitWebhook = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 webhook calls per minute (high to handle legitimate traffic)
  message: "Too many webhook requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests to detect potential attacks
});
