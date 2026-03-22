import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  BillingInterval,
  PaymentMethod,
  SubscriptionStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

// =======================
// SUBSCRIPTION SCHEMA - REFACTORED
// =======================

/**
 * Subscription model includes references to prices
 * (previously stored price/currency/interval directly - now stored via PlanPrice)
 */
export const SubscriptionSchema = z.object({
  id: z.number(),
  uid: z.string().uuid(),
  userId: z.number(),
  planId: z.number(),
  pendingPlanId: z.number().nullable(),
  status: z.nativeEnum(SubscriptionStatus),
  billingCycle: z.nativeEnum(BillingInterval),
  startedAt: z.coerce.date(),
  expiresAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  renewalProcessingAt: z.coerce.date().nullable(),
  renewedAt: z.coerce.date().nullable(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// =======================
// SUBSCRIPTION CREATION - REFACTORED
// =======================

/**
 * CREATE SUBSCRIPTION REQUEST
 * Now requires: planId, interval, currency
 * These determine the PlanPrice to fetch and associate
 */
export const SubscriptionCreateRequestSchema = z.object({
  planId: z.number().int().positive("Plan ID must be positive"),
  billingCycle: z.nativeEnum(BillingInterval),
  currency: z.string().length(3).toUpperCase(),
  platform: z.nativeEnum(PaymentMethod),
  redirectUrl: z.string().url(),
});

export type SubscriptionCreateRequest = z.infer<
  typeof SubscriptionCreateRequestSchema
>;

// =======================
// SUBSCRIPTION PAYMENT - REFACTORED
// =======================

/**
 * PAYMENT REQUEST
 * Includes planId and priceId when paying
 * This ensures we're paying for the exact price point (interval + currency combo)
 */
export const SubscriptionPaymentSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  planId: z.number().int().positive(),
  priceId: z.number().int().positive().optional(),
  couponCode: z.string().trim().min(2).optional(),
  billingCycle: z.nativeEnum(BillingInterval),
  currency: z.string().length(3).toUpperCase(),
  redirectUrl: z.string().url(),
  subscriptionId: z.number().optional(),
});

export type SubscriptionPaymentInput = z.infer<
  typeof SubscriptionPaymentSchema
>;

// =======================
// SUBSCRIPTION UPGRADE - REFACTORED
// =======================

/**
 * UPGRADE PLAN REQUEST
 * Similar to payment but indicates an existing subscription upgrade
 */
export const UpgradePlanSchema = z.object({
  planId: z.number().int().positive("Target plan ID must be positive"),
  priceId: z.number().int().optional(),
  couponCode: z.string().trim().min(2).optional(),
  billingCycle: z.nativeEnum(BillingInterval),
  currency: z.string().length(3).toUpperCase(),
  platform: z.nativeEnum(PaymentMethod),
  redirectUrl: z.string().url(),
});

export type UpgradePlanInput = z.infer<typeof UpgradePlanSchema>;

// =======================
// SUBSCRIPTION DOWNGRADE
// =======================

/**
 * DOWNGRADE PLAN REQUEST
 * No payment needed - scheduled for next billing cycle
 */
export const DowngradePlanSchema = z.object({
  planId: z.number().int().positive("Target plan ID must be positive"),
});

export type DowngradePlanInput = z.infer<typeof DowngradePlanSchema>;

// =======================
// SUBSCRIPTION RENEWAL - REFACTORED
// =======================

/**
 * RENEWAL REQUEST
 * Renews existing subscription for another cycle
 */
export const RenewSubscriptionPaymentSchema = z.object({
  planId: z.number().int().positive(),
  couponCode: z.string().trim().min(2).optional(),
  platform: z.nativeEnum(PaymentMethod),
  billingCycle: z.nativeEnum(BillingInterval),
  currency: z.string().length(3).toUpperCase(),
  redirectUrl: z.string().url(),
});

export type RenewSubscriptionPaymentInput = z.infer<
  typeof RenewSubscriptionPaymentSchema
>;

// =======================
// SUBSCRIPTION UPDATE
// =======================

export const SubscriptionUpdateRequestSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus),
  uid: z.string(),
});

export type SubscriptionUpdateRequest = z.infer<
  typeof SubscriptionUpdateRequestSchema
>;

// =======================
// SUBSCRIPTION UID
// =======================

export const SubscriptionUidSchema = z.object({
  uid: z.string(),
});

