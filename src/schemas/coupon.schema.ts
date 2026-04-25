import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  BillingInterval,
  CouponAppliesTo,
  DiscountType,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const CouponRuleSchema = z
  .object({
    planId: z.number().int().positive().optional().nullable(),
    interval: z.nativeEnum(BillingInterval).optional().nullable(),
    currency: z.string().length(3).toUpperCase().optional().nullable(),
    region: z.string().min(2).optional().nullable(),
  })
  .openapi("CouponRule");

export const CouponSchema = z
  .object({
    code: z.string().trim().min(2).max(50),
    couponOwnerEmail: z.string().email().optional().nullable(),
    type: z.nativeEnum(DiscountType),
    value: z.coerce.string().regex(/^\d+(\.\d{1,2})?$/),
    currency: z.string().length(3).toUpperCase().optional().nullable(),
    maxUses: z.coerce.number().int().positive().optional().nullable(),
    perUserLimit: z.coerce.number().int().positive().optional().nullable(),
    isActive: z.boolean().optional(),
    startsAt: z.coerce.date().optional().nullable(),
    expiresAt: z.coerce.date().optional().nullable(),
    minAmount: z.coerce.number().int().nonnegative().optional().nullable(),
    firstTimeOnly: z.boolean().optional(),
    appliesTo: z.array(z.nativeEnum(CouponAppliesTo)).optional(),
    contexts: z.array(z.string().trim().min(2).max(50)).optional(),
    isPublic: z.boolean().optional(),
    priority: z.coerce.number().int().optional(),
    autoApply: z.boolean().optional(),
    highlightText: z.string().trim().max(255).optional().nullable(),
    rules: z.array(CouponRuleSchema).optional(),
  })
  .openapi("Coupon");

export const CouponPublicSchema = z.object({
  code: z.string().trim().min(2).max(50),
  couponOwnerEmail: z.string().email().optional().nullable(),
  type: z.nativeEnum(DiscountType),
  value: z.coerce.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).toUpperCase().optional().nullable(),
});

export const CouponCreateSchema = z.object({
  code: z.string().trim().min(2).max(50),
  couponOwnerEmail: z.string().email().optional().nullable(),
  type: z.nativeEnum(DiscountType),
  value: z.coerce.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).toUpperCase().optional().nullable(),
  maxUses: z.coerce.number().int().positive().optional().nullable(),
  perUserLimit: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  startsAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  minAmount: z.coerce.number().int().nonnegative().optional().nullable(),
  firstTimeOnly: z.boolean().optional(),
  appliesTo: z.array(z.nativeEnum(CouponAppliesTo)).optional(),
  contexts: z.array(z.string().trim().min(2).max(50)).optional(),
  isPublic: z.boolean().optional(),
  priority: z.coerce.number().int().optional(),
  autoApply: z.boolean().optional(),
  highlightText: z.string().trim().max(255).optional().nullable(),
  rules: z.array(CouponRuleSchema).optional(),
});

export const CouponUpdateSchema = CouponCreateSchema.partial();

export const CouponUidSchema = z.object({
  uid: z.string(),
});

export const CouponApplySchema = z.object({
  code: z.string().trim().min(2),
  planId: z.coerce.number().int().positive(),
  appliesTo: z.nativeEnum(CouponAppliesTo),
  billingCycle: z.nativeEnum(BillingInterval),
  currency: z.string().length(3).toUpperCase(),
  region: z.string().trim().min(2).max(10).toUpperCase().optional(),
});

export const CouponPublicListQuerySchema = z.object({
  context: z.string().trim().min(2).max(50).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  appliesTo: z.nativeEnum(CouponAppliesTo).optional(),
  autoApply: z.coerce.boolean().optional(),
  code: z.string().trim().min(1).optional(),
});

export const CouponPublicContextQuerySchema = z.object({
  context: z.string().trim().min(2).max(50),
});
