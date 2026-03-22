import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  BillingInterval,
  SubscriptionPlanStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

// =======================
// FEATURES SCHEMA
// =======================

export const SubscriptionPlanFeaturesSchema = z.object({
  // Capacity limits
  stores: z.number(),
  products: z.number().nullable(), // null = unlimited
  staff_accounts: z.number(),
  payment_gateways: z.number(),
  available_templates: z.number(),

  // Core capabilities
  analytics: z.boolean(),
  api_access: z.boolean(),
  ai_features: z.boolean(),
  priority_support: z.boolean(),

  // Store customization
  custom_branding: z.boolean(),
  custom_domain: z.boolean(),
  free_ssl: z.boolean(),
  hide_platform_banner: z.boolean(),
  custom_templates: z.boolean(),

  // Product & order management
  unlimited_products: z.boolean(),
  social_store_order_sync: z.boolean(),
  social_store_service_sync: z.boolean(),

  // Communication features (store-level)
  store_email_notifications: z.boolean(),
  store_custom_emails: z.boolean(),
  store_newsletters: z.boolean(),

  // Shipping features
  max_shipping_accounts: z.number(),
});

export type SubscriptionPlanFeatures = z.infer<
  typeof SubscriptionPlanFeaturesSchema
>;

// =======================
// PLAN PRICE SCHEMA
// =======================

export const PlanPriceSchema = z.object({
  id: z.number(),
  planId: z.number(),
  interval: z.nativeEnum(BillingInterval),
  price: z.coerce.string(),
  tax: z.coerce.number().nullable().optional(),
  amountInMinor: z.number(),
  currency: z.string().toUpperCase().length(3),
  externalId: z.string().nullable().optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type PlanPrice = z.infer<typeof PlanPriceSchema>;

// Create a plan price
export const PlanPriceCreateRequestSchema = z.object({
  interval: z.nativeEnum(BillingInterval),
  price: z.coerce
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid decimal price"),
  tax: z.coerce.number().min(0).max(100).optional().nullable(),
  amountInMinor: z.coerce.number().int().positive("Amount must be positive"),
  currency: z.coerce.string().toUpperCase().length(3),
  externalId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export type PlanPriceCreateRequest = z.infer<
  typeof PlanPriceCreateRequestSchema
>;

// Update a plan price
export const PlanPriceUpdateRequestSchema = z.object({
  price: z.coerce
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  tax: z.coerce.number().min(0).max(100).optional().nullable(),
  amountInMinor: z.coerce.number().int().positive().optional(),
  externalId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

export type PlanPriceUpdateRequest = z.infer<
  typeof PlanPriceUpdateRequestSchema
>;

export const PlanPriceParamsSchema = z.object({
  planId: z.coerce.number().int().positive(),
  priceId: z.coerce.number().int().positive(),
});

export type PlanPriceParams = z.infer<typeof PlanPriceParamsSchema>;

// =======================
// SUBSCRIPTION PLAN - REFACTORED
// =======================

/**
 * Response schema for a single subscription plan
 * Includes available prices grouped by interval and currency
 */
export const SubscriptionPlanResponseSchema = z.object({
  id: z.number(),
  uid: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(SubscriptionPlanStatus),
  features: SubscriptionPlanFeaturesSchema,
  gracePeriod: z.coerce.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  prices: z.array(PlanPriceSchema),
});

export type SubscriptionPlanResponse = z.infer<
  typeof SubscriptionPlanResponseSchema
>;

// Create request schema - REFACTORED
// No longer accepts pricing fields - create those separately via PlanPrice
export const SubscriptionPlanCreateRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(SubscriptionPlanStatus).optional(),
  gracePeriod: z.coerce.number().optional().nullable(),
  features: SubscriptionPlanFeaturesSchema,
  // Optional: create initial prices during plan creation
  prices: z.array(PlanPriceCreateRequestSchema).optional(),
});

export type SubscriptionPlanCreateRequest = z.infer<
  typeof SubscriptionPlanCreateRequestSchema
>;

// Update request schema - REFACTORED
export const SubscriptionPlanUpdateRequestSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  status: z.nativeEnum(SubscriptionPlanStatus).optional(),
  gracePeriod: z.coerce.number().optional().nullable(),
  features: SubscriptionPlanFeaturesSchema.partial().optional(),
});

export type SubscriptionPlanUpdateRequest = z.infer<
  typeof SubscriptionPlanUpdateRequestSchema
>;

// UID schema
export const SubscriptionPlanUidSchema = z.object({
  uid: z.string(),
});
