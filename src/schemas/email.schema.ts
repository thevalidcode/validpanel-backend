import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { EmailLog, EmailStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

// Main schema
export const EmailLogSchema: z.ZodType<EmailLog> = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    sender: z.string(),
    receiver: z.string(),
    subject: z.string(),
    html: z.string(),
    status: z.nativeEnum(EmailStatus),
    messageId: z.string().nullable(),
    response: z.string().nullable(),
    timestamp: z.coerce.date(),
  })
  .openapi("EmailLog");

// UID schema
export const EmailLogUidSchema = z.object({
  uid: z.string().uuid(),
});

// Query parameters for listing emails
export const EmailListQuerySchema = z.object({
  status: z.nativeEnum(EmailStatus).optional(),
  receiver: z.string().email().optional(),
  sender: z.string().email().optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});
