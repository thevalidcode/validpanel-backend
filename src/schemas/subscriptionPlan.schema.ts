import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionPlanStatus,
} from "../../prisma/generated";
import { Decimal, JsonValue } from "@prisma/client/runtime/library";

extendZodWithOpenApi(z);

export const SubscriptionPlanSchema: z.ZodType<SubscriptionPlan> = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    interval: z.nativeEnum(BillingInterval),
    price: z.custom<Decimal>(),
    currency: z.string().toUpperCase().length(3),
    name: z.string(),
    description: z.string(),
    status: z.nativeEnum(SubscriptionPlanStatus),
    features: z.custom<JsonValue>(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi("SubscriptionPlan");

export const SubscriptionPlanCreateRequestSchema = z.object({
  interval: z.nativeEnum(BillingInterval),
  price: z.custom<Decimal>(),
  currency: z.string().toUpperCase().length(3),
  name: z.string(),
  description: z.string().optional(),
  features: z.record(z.string(), z.any()),
});

export const SubscriptionPlanUpdateRequestSchema = z.object({
  interval: z.nativeEnum(BillingInterval).optional(),
  price: z.custom<Decimal>().optional(),
  currency: z.string().toUpperCase().length(3).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  features: z.record(z.string(), z.any()).optional(),
  uid: z.string(),
});

export const SubscriptionPlanUidSchema = z.object({
  uid: z.string(),
});
