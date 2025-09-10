import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { StoreType } from "../../prisma/generated";
import { NormalizedOrder } from "../types/order.types";

extendZodWithOpenApi(z);

const orderStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "PARTIAL",
  "DELIVERED",
  "SHIPPED",
  "ACTIVE",
]);

export const OrderSchema: z.ZodType<NormalizedOrder> = z
  .object({
    customer: z.object({
      email: z.string().email(),
      name: z.string(),
      image: z.string().url(),
    }),
    storeType: z.nativeEnum(StoreType),
    id: z.string(),
    currency: z.string().toUpperCase().length(3),
    amount: z.string(),
    status: orderStatusEnum,
    createdAt: z.string().date(),
  })
  .openapi("Order");

export const GetAllOrdersRequestSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const GetMyOrdersRequestSchema = z.object({
  storeId: z.coerce.number(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});
