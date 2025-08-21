import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Store,
  StoreStatus,
  StoreType,
  UserPlan,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const StoreSchema: z.ZodType<Store> = z
  .object({
    storeId: z.number(),
    uid: z.string(),
    name: z.string(),
    description: z.string(),
    ssl: z.boolean(),
    status: z.nativeEnum(StoreStatus),
    type: z.nativeEnum(StoreType),
    ownerId: z.number(),
    timestamp: z.coerce.date(),
    plan: z.nativeEnum(UserPlan),
  })
  .openapi("Store");

export const CreateStoreSchema = z.object({
  description: z.string().min(3).max(500),
  name: z.string().min(3, "Store name must be at least 3 characters long"),
  type: z.nativeEnum(StoreType),
  ownerId: z.number(),
  domain: z.string().min(3).max(100),
});

export const UpdateStoreSchema = z.object({
  description: z.string().min(3).max(500).optional(),
  name: z
    .string()
    .min(3, "Store name must be at least 3 characters long")
    .optional(),
});

export const StoreUidSchema = z.object({
  uid: z.string().uuid(),
});

export const AdminActionSchema = z.object({
  uid: z.string().uuid(),
});
