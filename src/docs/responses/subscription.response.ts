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

export const SubscriptionObject = {
  description: "Single subscription object",
  content: {
    "application/json": {
      schema: SubscriptionSchema,
    },
  },
};

export const SubscriptionCreatedResponse = {
  description: "Successfully created a subscription",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Subscription added successfully."),
      }),
    },
  },
};

export const SubscriptionUpdatedResponse = {
  description: "Successfully updated a subscription",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Subscription updated successfully."),
      }),
    },
  },
};

export const SubscriptionPaymentResponse = {
  description: "Initialized payment successfully",
  content: {
    "application/json": {
      schema: z.object({
        status: z.literal("success"),
        url: z
          .string()
          .url()
          .describe(
            "This is the url the user will be redirected to, to complete the payment for the subscription."
          )
          .optional(),
        message: z.string().optional(),
      }),
    },
  },
};
