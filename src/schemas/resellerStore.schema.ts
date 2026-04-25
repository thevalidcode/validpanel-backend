import { z } from "zod";
import { StoreType } from "../../prisma/generated";

const StoreTypeSchema = z.nativeEnum(StoreType);

export const ResellerStoreListQuerySchema = z.object({
  type: StoreTypeSchema,
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const AdminResellerStoreListQuerySchema = z.object({
  type: StoreTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const ResellerStoreCreateSchema = z.object({
  name: z.string().min(2),
  url: z.string().min(3),
  type: StoreTypeSchema,
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const ResellerStoreUidParamsSchema = z.object({
  uid: z.string().min(1),
});

export const ResellerStoreUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  url: z.string().min(3).optional(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type ResellerStoreCreateInput = z.infer<
  typeof ResellerStoreCreateSchema
>;

export type AdminResellerStoreListQueryInput = z.infer<
  typeof AdminResellerStoreListQuerySchema
>;

export type ResellerStoreUpdateInput = z.infer<
  typeof ResellerStoreUpdateSchema
>;
