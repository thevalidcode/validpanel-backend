import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Payment, PaymentMethod, PaymentStatus } from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/library";

extendZodWithOpenApi(z);

export const InitializeSubscriptionPaymentSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  subscriptionId: z.number(),
  currency: z.string().length(3),
  redirect_url: z.string().url(),
});

export type CreateSubscriptionPaymentInput = z.infer<
  typeof InitializeSubscriptionPaymentSchema
>;

export const PaymentPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  planId: z.number(),
  id: z.number(),
  amount: z.custom<Decimal>(),
  chargedAmount: z.custom<Decimal>(),
  createdAt: z.coerce.date(),
  status: z.nativeEnum(PaymentStatus),
  method: z.nativeEnum(PaymentMethod),
});

export const PaymentSchema: z.ZodType<Payment> = PaymentPublicSchema.extend({
  userId: z.number(),
  uid: z.string().uuid(),
}).openapi("Payment");
