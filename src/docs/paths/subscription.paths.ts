import { registry } from "../components/registry";
import {
  SubscriptionCreateRequestSchema,
  SubscriptionUidSchema,
  SubscriptionUpdateRequestSchema,
} from "../../schemas/subscription.schema";

import {
  SubscriptionCreatedResponse,
  SubscriptionUpdatedResponse,
  SubscriptionUsersObject,
  SubscriptionForUsersListResponse,
  SubscriptionForAdminsListResponse,
  SubscriptionAdminsObject,
} from "../responses/subscription.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

// GET /subscriptions for users
registry.registerPath({
  method: "get",
  path: "/subscriptions",
  summary: "Get all Subscription for users",
  tags: ["Subscriptions"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: SubscriptionForUsersListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /subscriptions/admin for admins
registry.registerPath({
  method: "get",
  path: "/subscriptions/admin",
  summary: "Get all Subscription for admins",
  tags: ["Subscriptions"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: SubscriptionForAdminsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /subscriptions/admin/{uid} for admins
registry.registerPath({
  method: "get",
  path: "/subscriptions/admin/{uid}",
  summary: "Get Subscription by UID for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Subscriptions"],
  request: {
    params: SubscriptionUidSchema,
  },
  responses: {
    200: SubscriptionAdminsObject,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /subscriptions/{uid} for users
registry.registerPath({
  method: "get",
  path: "/subscriptions/{uid}",
  summary: "Get Subscription by UID for users",
  security: [{ CookieAuth: [] }],
  tags: ["Subscriptions"],
  request: {
    params: SubscriptionUidSchema,
  },
  responses: {
    200: SubscriptionUsersObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /subscriptions
registry.registerPath({
  method: "post",
  path: "/subscriptions",
  summary: "Create a new Subscription",
  tags: ["Subscriptions"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SubscriptionCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SubscriptionCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /subscriptions
registry.registerPath({
  method: "patch",
  path: "/subscriptions",
  summary: "Update a Subscription",
  tags: ["Subscriptions"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SubscriptionUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SubscriptionUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
