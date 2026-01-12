import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { ContactMessageStatus, ContactReplySender } from "../../prisma/generated";

extendZodWithOpenApi(z);

// Main contact message schema
export const ContactMessageSchema = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    message: z.string(),
    status: z.nativeEnum(ContactMessageStatus),
    emailMessageId: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi("ContactMessage");

// Contact reply schema
export const ContactReplySchema = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    contactMessageId: z.number(),
    sender: z.nativeEnum(ContactReplySender),
    senderName: z.string().nullable(),
    senderEmail: z.string().nullable(),
    content: z.string(),
    htmlContent: z.string().nullable(),
    emailMessageId: z.string().nullable(),
    inReplyTo: z.string().nullable(),
    references: z.array(z.string()),
    createdAt: z.coerce.date(),
  })
  .openapi("ContactReply");

// Contact message with replies
export const ContactMessageWithRepliesSchema = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    message: z.string(),
    status: z.nativeEnum(ContactMessageStatus),
    emailMessageId: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    replies: z.array(ContactReplySchema),
  })
  .openapi("ContactMessageWithReplies");

// Contact message list item with reply count
export const ContactMessageListItemSchema = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    message: z.string(),
    status: z.nativeEnum(ContactMessageStatus),
    emailMessageId: z.string().nullable(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    _count: z.object({
      replies: z.number(),
    }),
  })
  .openapi("ContactMessageListItem");

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

// Contact reply UID schema
export const ContactReplyUidSchema = z.object({
  replyUid: z.string(),
});

// Update status schema (for admin)
export const ContactMessageUpdateStatusSchema = z.object({
  status: z.nativeEnum(ContactMessageStatus),
});

// Reply to contact message schema (for admin)
export const ContactMessageReplySchema = z
  .object({
    message: z
      .string()
      .min(1, "Message is required")
      .max(10000, "Message must be 10000 characters or less")
      .trim(),
  })
  .openapi("ContactMessageReply");
