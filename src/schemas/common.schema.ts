import { z } from "zod";

export const UidSchema = z.object({
  uid: z.coerce.string(),
});

export const StoreIdSchema = z.object({
  storeId: z.coerce.number(),
});
