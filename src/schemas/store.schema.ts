import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Store, StoreStatus, StoreType } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const StoreSchema: z.ZodType<Store> = z
  .object({
    storeId: z.number(),
    uid: z.string(),
    name: z.string(),
    logoUrl: z.string(),
    color: z.string(),
    description: z.string(),
    ssl: z.boolean(),
    status: z.nativeEnum(StoreStatus),
    type: z.nativeEnum(StoreType),
    ownerId: z.number(),
    timestamp: z.coerce.date(),
    plan: z.string(),
  })
  .openapi("Store");

export const CreateStoreSchema = z.object({
  description: z.string().min(3).max(500).optional(),
  name: z.string().min(2, "Store name must be at least 2 characters long"),
  type: z.nativeEnum(StoreType),
  subscriptionId: z.number(),
  domain: z.string().min(3).max(100),
  logoUrl: z.string().optional(),
  color: z.string().optional(),
});

export const UpdateStoreSchema = z.object({
  description: z.string().min(3).max(500).optional(),
  logoUrl: z.string().optional(),
  color: z.string().optional(),
  status: z.nativeEnum(StoreStatus).optional(),
  name: z
    .string()
    .min(2, "Store name must be at least 2 characters long")
    .optional(),
});

export const StoreUidSchema = z.object({
  uid: z.string(),
});

export const AdminActionSchema = z.object({
  uid: z.string(),
});
