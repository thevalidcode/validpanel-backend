import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Notification, NotificationCategory } from "../../prisma/generated";
import { JsonValue } from "@prisma/client/runtime/client";

extendZodWithOpenApi(z);

export const NotificationTypeEnum = z.enum([
  "SUBSCRIPTION_PAYMENT",
  "SUBSCRIPTION_UPGRADE",
  "SUBSCRIPTION_DOWNGRADE",
  "SUBSCRIPTION_RENEWAL",
  "SUBSCRIPTION_EXPIRED",
  "STORE_APPROVED",
  "STORE_REJECTED",
  "STORE_CREATED",
  "STORE_PAUSED",
  "MANUAL_CREDIT",
  "MANUAL_DEBIT",
]);

export type NotificationType = z.infer<typeof NotificationTypeEnum>;

export const NotificationSchema: z.ZodType<Notification> = z
  .object({
    uid: z.string(),
    title: z.string(),
    message: z.string(),
    id: z.number(),
    userId: z.number(),
    meta: z
      .object({
        status: z.enum(["success", "failed", "warning"]),
        type: NotificationTypeEnum,
      })
      .catchall(z.unknown()) as z.ZodType<JsonValue>,
    isRead: z.boolean(),
    category: z.nativeEnum(NotificationCategory),
    createdAt: z.coerce.date(),
  })
  .openapi("Notification");

export const GetNotificationsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

export const NotificationsUidSchema = z.object({
  uid: z.string().uuid(),
});
