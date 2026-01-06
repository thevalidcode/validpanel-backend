import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";
const noopLimiter = (_req: any, _res: any, next: any) => next();

export const apiLimiter = isDev
  ? noopLimiter
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Max requests per IP
      standardHeaders: true, // Return rate limit info in headers
      legacyHeaders: false,
      message: {
        status: 429,
        error: "Too many requests, please try again later.",
      },
    });

// Export all specialized rate limiters
export * from "./auth.ratelimit";
export * from "./user.ratelimit";
export * from "./admin.ratelimit";
export * from "./store.ratelimit";
export * from "./subscription.ratelimit";
export * from "./subscriptionPlan.ratelimit";
export * from "./payment.ratelimit";
export * from "./paymentGateway.ratelimit";
export * from "./transaction.ratelimit";
export * from "./order.ratelimit";
export * from "./notification.ratelimit";
export * from "./setting.ratelimit";
export * from "./rate.ratelimit";
export * from "./webhook.ratelimit";
export * from "./files.ratelimit";
export * from "./common.ratelimit";
