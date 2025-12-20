import { z } from "zod";
import {
  UserSchema,
  UserPublicSchema,
  AuthenticateUserResponseSchema,
  VerifySessionResponseSchema,
} from "../../schemas/user.schema";
import { SubscriptionSchema } from "../../schemas/subscription.schema";
import { StoreSchema } from "../../schemas/store.schema";

export const AuthenticateUserResponse = {
  description: "Authenticated user session object",
  content: {
    "application/json": {
      schema: AuthenticateUserResponseSchema,
    },
  },
};

export const GetUserByUidResponse = {
  description: "Public-facing user profile",
  content: {
    "application/json": {
      schema: UserPublicSchema,
    },
  },
};

export const CreateUserResponse = {
  description: "User created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("User created successfully"),
        user: UserSchema,
        nextStep: z
          .literal("PLAN")
          .describe(
            "This shows the next step the user is suppose to take which is selecting a pricing plan."
          ),
      }),
    },
  },
};

export const VerifySessionResponse = {
  description: "Authenticated user session object",
  content: {
    "application/json": {
      schema: VerifySessionResponseSchema,
    },
  },
};

export const UpdateSuccess = {
  description: "User updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Updated user successfully"),
        user: UserSchema,
      }),
    },
  },
};

export const InvalidData = {
  description: "Request is missing or has invalid fields",
  content: {
    "application/json": {
      schema: z.object({
        error: z.literal("No valid fields to update"),
      }),
    },
  },
};

export const UsersListResponse = {
  description: "List of users",
  content: {
    "application/json": {
      schema: z.array(UserSchema),
    },
  },
};

export const UserObject = {
  description: "Single user data",
  content: {
    "application/json": {
      schema: z.object({
        user: UserSchema,
      }),
    },
  },
};

export const LoginResponse = {
  description: "Login success response",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Logged in successfully"),
      }),
    },
  },
};

export const GoogleLoginResponse = {
  description: "Successful login",
  content: {
    "application/json": {
      schema: z.object({
        token: z.string(),
        user: UserSchema,
      }),
    },
  },
};

export const AnalyticsResponse = {
  description: "Analytics retrieved successfully",
  content: {
    "application/json": {
      schema: z.object({
        stores: z.object({
          total: z.object({
            value: z.number(),
            change: z.string(),
          }),
          active: z.object({
            value: z.number(),
            change: z.string(),
          }),
        }),
        subscription: z.object({
          currentPlan: z.string(),
          nextBillingDate: z.date().nullable(),
          features: z.array(
            z.object({
              name: z.string(),
              value: z.number().nullable(),
            })
          ),
        }),
        platformEvents: z.object({
          "Last 7 days": z.array(
            z.object({
              name: z.string(),
              value: z.number(),
            })
          ),
          "Last 30 days": z.array(
            z.object({
              name: z.string(),
              value: z.number(),
            })
          ),
          "Last 90 days": z.array(
            z.object({
              name: z.string(),
              value: z.number(),
            })
          ),
        }),
        allStores: z.array(StoreSchema),
      }),
    },
  },
};

export const SetupStoreResponse = {
  description: "Store setup was successful",
  content: {
    "application/json": {
      schema: z.object({
        message: z.string(),
        store: StoreSchema,
        onboardingStep: z
          .literal("COMPLETE")
          .describe(
            "This means that the user has completed all the onboarding steps and can move on to other pages."
          ),
      }),
    },
  },
};
