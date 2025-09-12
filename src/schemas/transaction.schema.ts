import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/library";

extendZodWithOpenApi(z);

export const TransactionPublicSchema = z.object({
  currency: z.string().toUpperCase(),
  amount: z.custom<Decimal>(),
  id: z.number(),
  type: z.nativeEnum(TransactionType),
  timestamp: z.coerce.date(),
  status: z.nativeEnum(TransactionStatus),
});

export const TransactionSchema: z.ZodType<Transaction> =
  TransactionPublicSchema.extend({
    userUid: z.string().uuid(),
    uid: z.string().uuid(),
  }).openapi("Transaction");
