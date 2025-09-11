import { z } from "zod";
import { SubscriptionSchema } from "../../schemas/subscription.schema";

export const SubscriptionForAdminsListResponse = {
  description: "List of all subscriptions for admins",
  content: {
    "application/json": {
      schema: z.array(SubscriptionSchema),
    },
  },
};

export const SubscriptionForUsersListResponse = {
  description: "List of all subscriptions for users",
  content: {
    "application/json": {
      schema: z.array(SubscriptionSchema),
    },
  },
};

export const SubscriptionAdminsObject = {
  description: "Single subscription object",
  content: {
    "application/json": {
      schema: z.object({
        SubscriptionSchema,
      }),
    },
  },
};

export const SubscriptionUsersObject = {
  description: "Single subscription object",
  content: {
    "application/json": {
      schema: z.object({
        SubscriptionSchema,
      }),
    },
  },
};

export const SubscriptionCreatedResponse = {
  description: "Successfully created a subscription",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Subscription added successfully.")
      }),
    },
  },
};

export const SubscriptionUpdatedResponse = {
  description: "Successfully updated a subscription",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Subscription updated successfully.")
      }),
    },
  },
};