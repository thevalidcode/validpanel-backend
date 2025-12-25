import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { PlatformEventCategory, PlatformEvent } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const PlatformEventSchema: z.ZodType<PlatformEvent> = z
  .object({
    id: z.number(),
    userId: z.number().nullable(),
    adminId: z.number().nullable(),
    entityUid: z.string().nullable(),
    event: z.string(),
    uid: z.string().uuid(),
    createdAt: z.coerce.date(),
    category: z.nativeEnum(PlatformEventCategory),
  })
  .openapi("PlatformEvent");
