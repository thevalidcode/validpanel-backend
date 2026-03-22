import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Strict limiter for creating subscription plans
export const limitSubscriptionPlanCreate = devBypass(
  rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // 5 plan creations per 30 minutes
    message:
      "Too many subscription plan creation attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Limiter for updating subscription plans
export const limitSubscriptionPlanUpdate = devBypass(
  rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // 20 updates per 10 minutes
    message: "Too many subscription plan update attempts. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Strict limiter for deleting subscription plans
export const limitSubscriptionPlanDelete = devBypass(
  rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10, // 10 deletions per 30 minutes
    message:
      "Too many subscription plan deletion attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Limiter for viewing subscription plans
export const limitSubscriptionPlanView = devBypass(
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // 50 requests per 5 minutes (higher since users browse plans)
    message: "Too many subscription plan view requests. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const limitSubscriptionPlanPriceCreate = devBypass(
  rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 40, // 40 price creations per 30 minutes
    message:
      "Too many subscription plan price creation attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
