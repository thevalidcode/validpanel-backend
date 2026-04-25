import { z } from "zod";

export const ResellerSourceStoresResponse = {
  description: "List of reseller sources",
  content: {
    "application/json": {
      schema: z.object({
        sources: z.array(
          z.object({
            id: z.string(),
            type: z.enum(["shop", "smm"]),
            name: z.string(),
            image: z.string(),
            description: z.string().nullable().optional(),
            itemCount: z.number(),
          }),
        ),
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

export const ResellerSourceProductsResponse = {
  description: "Product preview payload from a source supplier",
  content: {
    "application/json": {
      schema: z.object({
        sourceSupplier: z.object({
          shopId: z.number(),
          uid: z.string(),
          name: z.string(),
        }),
        products: z.array(
          z.object({
            uid: z.string(),
            name: z.string(),
            description: z.string().nullable().optional(),
            price: z.union([z.string(), z.number()]),
            currency: z.string(),
          }),
        ),
      }),
    },
  },
};

export const ResellerSourceServicesResponse = {
  description: "Service preview payload from a source provider",
  content: {
    "application/json": {
      schema: z.object({
        provider: z.object({
          providerId: z.string(),
          sourceUid: z.string(),
          name: z.string(),
          url: z.string(),
        }),
        services: z.array(
          z.object({
            uid: z.string(),
            name: z.string(),
            description: z.string().nullable().optional(),
            price: z.union([z.string(), z.number()]),
            currency: z.string().nullable().optional(),
            min: z.number(),
            max: z.number(),
          }),
        ),
      }),
    },
  },
};

export const StartResellingResponse = {
  description: "Reselling setup completed",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: z.object({
          targetStore: z.any(),
          importResult: z.any(),
        }),
      }),
    },
  },
};

export const SyncResellingResponse = {
  description: "Reseller store synchronization completed",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: z.object({
          targetStore: z.any(),
          syncResult: z.any(),
        }),
      }),
    },
  },
};
