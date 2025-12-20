import { registry } from "../components/registry";
import {
  DowngradePlanSchema,
  RenewSubscriptionPaymentSchema,
  SubscriptionCreateRequestSchema,
  SubscriptionUidSchema,
  SubscriptionUpdateRequestSchema,
  UpgradePlanSchema,
} from "../../schemas/subscription.schema";

import {
  SubscriptionCreatedResponse,
  SubscriptionUpdatedResponse,
  SubscriptionObject,
  SubscriptionForUsersListResponse,
  SubscriptionForAdminsListResponse,
  SubscriptionPaymentResponse,
} from "../responses/subscription.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
  SuccessResponse,
} from "../responses/common.response";
import { SubscriptionPaymentSchema } from "../../schemas/subscription.schema";

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

// GET /subscriptions/active for users
registry.registerPath({
  method: "get",
  path: "/subscriptions/active",
  summary: "Get active subscription for users",
  tags: ["Subscriptions"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: SubscriptionObject,
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
    200: SubscriptionObject,
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
    200: SubscriptionObject,
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

// PATCH /subscriptions/upgrade-plan
registry.registerPath({
  method: "patch",
  path: "/subscriptions/upgrade-plan",
  summary: "Upgrade a user's plan",
  tags: ["Subscriptions"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpgradePlanSchema,
        },
      },
    },
  },
  responses: {
    200: SubscriptionPaymentResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// PATCH /subscriptions/downgrade-plan
registry.registerPath({
  method: "patch",
  path: "/subscriptions/downgrade-plan",
  summary: "Downgrade a user's plan",
  tags: ["Subscriptions"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: DowngradePlanSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /subscriptions
registry.registerPath({
  method: "post",
  path: "/subscriptions",
  summary: "Create a new subscription for authenticated users",
  tags: ["Subscriptions"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SubscriptionPaymentSchema,
        },
      },
    },
  },
  responses: {
    200: SubscriptionPaymentResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /subscriptions/renew
registry.registerPath({
  method: "post",
  path: "/subscriptions/renew",
  summary: "Renew a subscription for authenticated users",
  tags: ["Subscriptions"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RenewSubscriptionPaymentSchema,
        },
      },
    },
  },
  responses: {
    200: SubscriptionPaymentResponse,
    400: BadRequest,
    500: ServerError,
  },
});
