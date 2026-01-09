import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionPlanStatus,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";

extendZodWithOpenApi(z);

// Convert features type to Zod schema
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
});

export type SubscriptionPlanFeatures = z.infer<
  typeof SubscriptionPlanFeaturesSchema
>;

// Main schema
export const SubscriptionPlanSchema: z.ZodType<SubscriptionPlan> = z
  .object({
    id: z.number(),
    discountForAnnually: z.number(),
    tax: z.number(),
    uid: z.string().uuid(),
    interval: z.nativeEnum(BillingInterval),
    price: z.custom<Decimal>(),
    currency: z.string().toUpperCase().length(3),
    name: z.string(),
    description: z.string(),
    gracePeriod: z.number(),
    status: z.nativeEnum(SubscriptionPlanStatus),
    features: SubscriptionPlanFeaturesSchema, // <- typed here
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi("SubscriptionPlan");

// Create request schema
export const SubscriptionPlanCreateRequestSchema = z.object({
  interval: z.nativeEnum(BillingInterval),
  price: z.string(),
  currency: z.string().toUpperCase().length(3),
  name: z.string(),
  discountForAnnually: z.coerce.number().optional().nullable(),
  tax: z.coerce.number().optional().nullable(),
  description: z.string().optional().nullable(),
  gracePeriod: z.coerce.number().optional().nullable(),
  features: SubscriptionPlanFeaturesSchema, // <- typed here
});

// Update request schema
export const SubscriptionPlanUpdateRequestSchema = z.object({
  interval: z.nativeEnum(BillingInterval).optional(),
  price: z.string().optional(),
  currency: z.string().toUpperCase().length(3).optional(),
  name: z.string().optional(),
  discountForAnnually: z.number().optional().nullable(),
  tax: z.coerce.number().optional().nullable(),
  gracePeriod: z.coerce.number().optional().nullable(),
  description: z.string().optional().nullable(),
  features: SubscriptionPlanFeaturesSchema.partial().optional(), // <- allow partial updates
});

// UID schema
export const SubscriptionPlanUidSchema = z.object({
  uid: z.string(),
});
