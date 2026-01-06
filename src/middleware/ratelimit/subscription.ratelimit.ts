import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

// Strict limiter for subscription creation
export const limitSubscriptionCreate = devBypass(
  rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 5, // 5 subscription creations per 30 minutes
  message: "Too many subscription creation attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Strict limiter for plan upgrades
export const limitPlanUpgrade = devBypass(
  rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // 3 upgrades per 30 minutes
  message: "Too many plan upgrade attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Strict limiter for plan downgrades
export const limitPlanDowngrade = devBypass(
  rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3, // 3 downgrades per 30 minutes
  message: "Too many plan downgrade attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Strict limiter for subscription renewals
export const limitSubscriptionRenew = devBypass(
  rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 renewals per 15 minutes
  message: "Too many subscription renewal attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Limiter for viewing subscriptions
export const limitSubscriptionView = devBypass(
  rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requests per 5 minutes
  message: "Too many subscription view requests. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);

// Limiter for subscription updates (admin)
export const limitSubscriptionUpdate = devBypass(
  rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 15, // 15 updates per 10 minutes
  message: "Too many subscription update attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
  })
);
