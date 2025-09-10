import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Subscription, SubscriptionStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const SubscriptionSchema: z.ZodType<Subscription> = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    userId: z.number(),
    currency: z.string().toUpperCase().length(3),
    planId: z.number(),
    startedAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    status: z.nativeEnum(SubscriptionStatus),
  })
  .openapi("Subscription");
