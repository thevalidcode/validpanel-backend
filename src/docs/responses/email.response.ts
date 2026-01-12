import { z } from "zod";
import { EmailLogSchema } from "../../schemas/email.schema";

export const EmailLogListResponse = {
  description: "List of email logs with pagination",
  content: {
    "application/json": {
      schema: z.object({
        data: z.array(EmailLogSchema),
        pagination: z.object({
          total: z.number(),
          limit: z.number(),
          offset: z.number(),
          hasMore: z.boolean(),
        }),
      }),
    },
  },
};

export const EmailLogObjectResponse = {
  description: "Single email log object",
  content: {
    "application/json": {
      schema: EmailLogSchema,
    },
  },
};

export const EmailLogDeletedResponse = {
  description: "Successfully deleted email log",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Email log deleted successfully"),
      }),
    },
  },
};

export const EmailNotFoundResponse = {
  description: "Email log not found",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("Email not found"),
      }),
    },
  },
};
