import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Payment, PaymentMethod, PaymentStatus } from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/library";

extendZodWithOpenApi(z);

export const PaymentPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  subscriptionId: z.number(),
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
