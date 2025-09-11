import { z } from "zod";
import { SubscriptionPlanSchema } from "../../schemas/subscriptionPlan.schema";

export const SubscriptionPlanForAdminsListResponse = {
  description: "List of all subscription plans for admins",
  content: {
    "application/json": {
      schema: z.array(SubscriptionPlanSchema),
    },
  },
};

export const SubscriptionPlanForUsersListResponse = {
  description: "List of all subscription plans for users",
  content: {
    "application/json": {
      schema: z.array(SubscriptionPlanSchema),
    },
  },
};

export const SubscriptionPlanAdminsObject = {
  description: "Single subscription plan object",
  content: {
    "application/json": {
      schema: z.object({
        SubscriptionPlanSchema,
      }),
    },
  },
};

export const SubscriptionPlanUsersObject = {
  description: "Single subscription plan object",
  content: {
    "application/json": {
      schema: z.object({
        SubscriptionPlanSchema,
      }),
    },
  },
};

export const SubscriptionPlanCreatedResponse = {
  description: "Successfully created a subscription plan",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Subscription Plan added successfully."),
      }),
    },
  },
};

export const SubscriptionPlanUpdatedResponse = {
  description: "Successfully updated a subscription plan",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Subscription Plan updated successfully."),
      }),
    },
  },
};

export const SubscriptionPlanDeletedResponse = {
  description: "Successfully deleted a subscription plan",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Subscription Plan deleted successfully."),
      }),
    },
  },
};
