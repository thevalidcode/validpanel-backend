import { registry } from "../components/registry";
import { z } from "zod";
import {
  AuthenticateUserSchema,
  createUserRequestSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  setupStoreSchema,
  UidsSchema,
  updateUserSchema,
  VerifySessionSchema,
} from "../../schemas/user.schema";

import {
  UpdateSuccess,
  InvalidData,
  UsersListResponse,
  AuthenticateUserResponse,
  VerifySessionResponse,
  GetUserByUidResponse,
  CreateUserResponse,
  SetupStoreResponse,
  AnalyticsResponse,
} from "../responses/user.response";

import {
  BadRequest,
  Forbidden,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";

// Authenticate user
registry.registerPath({
  method: "post",
  path: "/users/me",
  summary: "Authenticate user",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthenticateUserSchema,
        },
      },
    },
  },
  responses: {
    200: AuthenticateUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Verify User's Session
registry.registerPath({
  method: "post",
  path: "/users/verify-session",
  summary: "Verify session code for user authentication",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifySessionSchema,
        },
      },
    },
  },
  responses: {
    200: VerifySessionResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Get all users (admin)
registry.registerPath({
  method: "get",
  path: "/users",
  summary: "Get all users",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: UsersListResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Get single user by UID
registry.registerPath({
  method: "get",
  path: "/users/{uid}",
  summary: "Get user by UID",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  parameters: [
    {
      name: "uid",
      in: "path",
      required: true,
      schema: { type: "string" },
    },
  ],
  responses: {
    200: GetUserByUidResponse,
    403: Forbidden,
    500: ServerError,
  },
});

// Create user
registry.registerPath({
  method: "post",
  path: "/users",
  summary: "Create a new user",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserRequestSchema,
        },
      },
    },
  },
  responses: {
    200: CreateUserResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Update user
registry.registerPath({
  method: "patch",
  path: "/users",
  summary: "Update user info",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateUserSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateSuccess,
    400: InvalidData,
    500: ServerError,
  },
});

// Delete single user
registry.registerPath({
  method: "delete",
  path: "/users",
  summary: "Delete a single user",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            uid: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Delete multiple users
registry.registerPath({
  method: "delete",
  path: "/users/multiple",
  summary: "Delete multiple users",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UidsSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Ban multiple users
registry.registerPath({
  method: "patch",
  path: "/users/ban-multiple",
  summary: "Ban multiple users",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UidsSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// Activate multiple users
registry.registerPath({
  method: "patch",
  path: "/users/activate-multiple",
  summary: "Activate multiple users",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UidsSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// User's analytics
registry.registerPath({
  method: "get",
  path: "/users/analytics",
  summary: "User's analytics",
  tags: ["Users"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: AnalyticsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// User's forgot password
registry.registerPath({
  method: "post",
  path: "/users/forgot-password",
  summary: "Send password reset link to user's email",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: forgotPasswordSchema,
        },
      },
    },
  },
  security: [{ CookieAuth: [] }],
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// User's reset password
registry.registerPath({
  method: "post",
  path: "/users/reset-password",
  summary: "Reset user's password",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  security: [{ CookieAuth: [] }],
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

/**
 *
 * ROUTES FOR ONBOARDING USERS
 *
 */

registry.registerPath({
  method: "post",
  path: "/users/onboarding/setup",
  summary: "Setup store for onboarding users",
  tags: ["Users"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: setupStoreSchema,
        },
      },
    },
  },
  responses: {
    200: SetupStoreResponse,
    400: BadRequest,
    500: ServerError,
  },
});
