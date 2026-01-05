import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  BillingInterval,
  PaymentMethod,
  Subscription,
  SubscriptionStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const SubscriptionSchema: z.ZodType<Subscription> = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    userId: z.number(),
    pendingPlanId: z.number(),
    currency: z.string().toUpperCase().length(3),
    planId: z.number(),
    startedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    renewedAt: z.coerce.date(),
    renewalProcessingAt: z.coerce.date(),
    billingCycle: z.nativeEnum(BillingInterval),
    status: z.nativeEnum(SubscriptionStatus),
  })
  .openapi("Subscription");

export const SubscriptionCreateRequestSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  redirectUrl: z.string(),
  currency: z.string(),
  billingCycle: z.nativeEnum(BillingInterval),
  planId: z.number(),
});

export const SubscriptionPaymentSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  subscriptionId: z.number().optional(),
  billingCycle: z.nativeEnum(BillingInterval),
  planId: z.number(),
  currency: z.string().length(3),
  redirectUrl: z.string().url(),
});

export type SubscriptionPaymentInput = z.infer<
  typeof SubscriptionPaymentSchema
>;

export const SubscriptionUpdateRequestSchema = z.object({
  status: z.nativeEnum(SubscriptionStatus),
  uid: z.string(),
});

export const UpgradePlanSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  redirectUrl: z.string(),
  currency: z.string(),
  billingCycle: z.nativeEnum(BillingInterval),
  planId: z.number().describe("The new plan id the user wants to upgrade to"),
});

export const RenewSubscriptionPaymentSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  redirectUrl: z.string(),
  currency: z.string(),
  planId: z.number(),
});

export const DowngradePlanSchema = z.object({
  planId: z.number().describe("The new plan id the user wants to downgrade to"),
});

export const SubscriptionUidSchema = z.object({
  uid: z.string(),
});
