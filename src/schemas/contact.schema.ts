import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ContactMessage, ContactMessageStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

// Main schema
export const ContactMessageSchema: z.ZodType<ContactMessage> = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    message: z.string(),
    status: z.nativeEnum(ContactMessageStatus),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi("ContactMessage");

// Create request schema
export const ContactMessageCreateRequestSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be 50 characters or less")
      .trim(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be 50 characters or less")
      .trim(),
    email: z
      .string()
      .email("Invalid email format")
      .toLowerCase()
      .trim(),
    message: z
      .string()
      .min(1, "Message is required")
      .max(5000, "Message must be 5000 characters or less")
      .trim(),
  })
  .openapi("ContactMessageCreateRequest");

// UID schema
export const ContactMessageUidSchema = z.object({
  uid: z.string(),
});

// Update status schema (for admin)
export const ContactMessageUpdateStatusSchema = z.object({
  status: z.nativeEnum(ContactMessageStatus),
});
