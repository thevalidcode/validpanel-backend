import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Decimal } from "@prisma/client/runtime/library";

extendZodWithOpenApi(z);

const orderStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  "FAILED",
  "ON-HOLD",
  "PARTIAL",
  "DISPUTED",
  "AWAITING",
  "DELIVERED",
  "ACTIVE",
]);

const orderTypeEnum = z.enum(["social-media-store", "digital", "shop"]);

export const OrderSchema = z
  .object({
    id: z.number(),
    type: orderTypeEnum,
    uid: z.string().uuid(),
    currency: z.string().toUpperCase().length(3),
    amount: z.custom<Decimal>(),
    user: z.object({
      id: z.number(),
      email: z.string().email(),
      name: z.string(),
      image: z.string().url(),
    }),
    date: z.coerce.date(),
    status: orderStatusEnum,
  })
  .openapi("Order");

export const GetAllOrderRequestSchema = z
  .object({
    storeType: orderTypeEnum,
    storeId: z.string().uuid(),
    email: z.string().email()
  })