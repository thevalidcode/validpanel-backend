import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PaymentMethod, TransactionStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const InitializeSubscriptionPaymentSchema = z.object({
  platform: z.nativeEnum(PaymentMethod),
  subscriptionId: z.number(),
  currency: z.string().length(3),
  redirect_url: z.string().url(),
});

export type CreateSubscriptionPaymentInput = z.infer<typeof InitializeSubscriptionPaymentSchema>;

export const TransactionPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  amount: z.number(),
  chargedAmount: z.number(),
  timestamp: z.coerce.date(),
  status: z.nativeEnum(TransactionStatus),
  paymentGateway: z.nativeEnum(PaymentMethod),
});

export const TransactionSchema = TransactionPublicSchema.extend({
  userUid: z.string().uuid(),
  uid: z.string().uuid(),
}).openapi("Transaction");
