import { z } from "zod";
import {
  ContactMessageSchema,
  ContactMessageListItemSchema,
  ContactMessageWithRepliesSchema,
  ContactReplySchema,
} from "../../schemas/contact.schema";

export const ContactMessageCreatedResponse = {
  description: "Contact message successfully received",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        message: z.literal(
          "Your message has been sent. We will respond within 24 hours."
        ),
      }),
    },
  },
};

export const ContactMessageListResponse = {
  description: "List of all contact messages with reply count (admin only)",
  content: {
    "application/json": {
      schema: z.array(ContactMessageListItemSchema),
    },
  },
};

export const ContactMessageObjectResponse = {
  description: "Single contact message object",
  content: {
    "application/json": {
      schema: ContactMessageSchema,
    },
  },
};

export const ContactMessageWithRepliesResponse = {
  description: "Contact message with all replies",
  content: {
    "application/json": {
      schema: ContactMessageWithRepliesSchema,
    },
  },
};

export const ContactMessageUpdatedResponse = {
  description: "Successfully updated contact message status",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Contact message status updated successfully"),
      }),
    },
  },
};

export const ContactMessageDeletedResponse = {
  description: "Successfully deleted contact message",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Contact message deleted successfully"),
      }),
    },
  },
};

export const ContactMessageNotFoundResponse = {
  description: "Contact message not found",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("Contact message not found"),
      }),
    },
  },
};

// Contact Reply Responses
export const ContactReplyListResponse = {
  description: "List of all replies for a contact message",
  content: {
    "application/json": {
      schema: z.array(ContactReplySchema),
    },
  },
};

export const ContactReplyObjectResponse = {
  description: "Single contact reply object",
  content: {
    "application/json": {
      schema: ContactReplySchema.extend({
        contactMessage: z.object({
          uid: z.string(),
          firstName: z.string(),
          lastName: z.string(),
          email: z.string(),
        }),
      }),
    },
  },
};

export const ContactMessageReplyResponse = {
  description: "Successfully sent reply to contact message",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal(true),
        message: z.literal("Reply sent successfully"),
        data: ContactReplySchema,
      }),
    },
  },
};

export const ContactReplyNotFoundResponse = {
  description: "Contact reply not found",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("Contact reply not found"),
      }),
    },
  },
};

export const ContactReplyDeletedResponse = {
  description: "Successfully deleted contact reply",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Contact reply deleted successfully"),
      }),
    },
  },
};
