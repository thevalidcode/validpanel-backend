import { z } from "zod";
import { StoreType } from "../../prisma/generated";

export const MarginTypeSchema = z.enum(["percentage", "fixed"]);
export const DomainModeSchema = z.enum(["validpanel", "custom"]);

export const StartResellingSchema = z
  .object({
    supplierId: z.string().min(1).optional(),
    providerId: z.string().min(1).optional(),
    marginType: MarginTypeSchema,
    marginValue: z.coerce.number().nonnegative(),
    sourceType: z.nativeEnum(StoreType).default(StoreType.SHOP),
    targetStoreUid: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "SHOP" && !data.supplierId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supplierId"],
        message: "supplierId is required when sourceType is shop",
      });
    }

    if (data.sourceType === "SOCIAL" && !data.providerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["providerId"],
        message: "providerId is required when sourceType is social media store",
      });
    }
  });

export const SourceStoresQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sourceType: z.nativeEnum(StoreType).default(StoreType.SHOP),
});

export const SupplierIdParamsSchema = z.object({
  supplierId: z.string().min(1),
});

export const ProviderIdParamsSchema = z.object({
  providerId: z.string().min(1),
});

export const SyncResellerStoreParamsSchema = z.object({
  targetStoreUid: z.string().min(1),
});

export const SyncResellerStoreSchema = z
  .object({
    supplierId: z.string().min(1).optional(),
    providerId: z.string().min(1).optional(),
    sourceType: z.nativeEnum(StoreType).default(StoreType.SHOP),
    marginType: MarginTypeSchema,
    marginValue: z.coerce.number().nonnegative(),
  })
  .superRefine((data, ctx) => {
    if (data.sourceType === "SHOP" && !data.supplierId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["supplierId"],
        message: "supplierId is required when sourceType is shop",
      });
    }

    if (data.sourceType === "SOCIAL" && !data.providerId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["providerId"],
        message: "providerId is required when sourceType is social media store",
      });
    }
  });

export type StartResellingInput = z.infer<typeof StartResellingSchema>;
