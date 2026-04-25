import { z } from "zod";
import { StoreType } from "../../../prisma/generated";

const ResellerStoreObjectSchema = z.object({
  uid: z.string(),
  name: z.string(),
  url: z.string(),
  image: z.string().nullable().optional(),
  type: z.nativeEnum(StoreType),
  isActive: z.boolean(),
  isInternal: z.boolean(),
  storeId: z.number().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ResellerStoreListResponse = {
  description: "List of reseller stores",
  content: {
    "application/json": {
      schema: z.object({
        resellerStores: z.array(ResellerStoreObjectSchema),
        meta: z.object({
          total: z.number(),
          page: z.number(),
          pages: z.number(),
          limit: z.number(),
        }),
      }),
    },
  },
};

export const ResellerStoreObjectResponse = {
  description: "Reseller store object",
  content: {
    "application/json": {
      schema: z.object({
        resellerStore: ResellerStoreObjectSchema,
      }),
    },
  },
};

export const ResellerStoreWriteResponse = {
  description: "Reseller store write response",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        resellerStore: ResellerStoreObjectSchema.optional(),
      }),
    },
  },
};
