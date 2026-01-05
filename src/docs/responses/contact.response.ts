import { z } from "zod";
import { ContactMessageSchema } from "../../schemas/contact.schema";

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
  description: "List of all contact messages (admin only)",
  content: {
    "application/json": {
      schema: z.array(ContactMessageSchema),
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
