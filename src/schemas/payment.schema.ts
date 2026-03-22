import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Payment, PaymentMethod, PaymentStatus } from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";
import { UserPublicSchema } from "./user.schema";
import { CouponPublicSchema } from "./coupon.schema";

extendZodWithOpenApi(z);

export const PaymentPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  subscriptionId: z.number().nullable(),
  planId: z.number(),
  id: z.number(),
  amount: z.custom<Decimal>(),
  chargedAmount: z.custom<Decimal>(),
  discountAmount: z.custom<Decimal>(),
  taxAmount: z.custom<Decimal>().nullable(),
  finalAmount: z.custom<Decimal>(),
  couponId: z.number().nullable(),
  createdAt: z.coerce.date(),
  status: z.nativeEnum(PaymentStatus),
  method: z.nativeEnum(PaymentMethod),
  user: UserPublicSchema,
  coupon: CouponPublicSchema.nullable(),
});

export const PaymentSchema: z.ZodType<Payment> = PaymentPublicSchema.extend({
  userId: z.number(),
  uid: z.string().uuid(),
}).openapi("Payment");
