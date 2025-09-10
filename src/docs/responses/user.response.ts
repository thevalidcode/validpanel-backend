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

export const SelectPlanResponse = {
  description: "Plan selected successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.literal("Plan selected successfully"),
        subscription: SubscriptionSchema,
        nextStep: z
          .enum(["STORE_DETAILS", "PAYMENT"])
          .describe(
            "This shows the next step the user is suppose to take which is STORE_DETAILS if the plan's price is equal 0 and PAYMENT if the price isn't."
          ),
      }),
    },
  },
};

export const InitializeSubscriptionPaymentResponse = {
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
          ),
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
