import { registry } from "../components/registry";
import {
  PlanPriceParamsSchema,
  SubscriptionPlanUidSchema,
  SubscriptionPlanCreateRequestSchema,
  SubscriptionPlanUpdateRequestSchema,
} from "../../schemas/subscriptionPlan.schema";

import {
  SubscriptionPlanCreatedResponse,
  SubscriptionPlanUpdatedResponse,
  SubscriptionPlanDeletedResponse,
  PlanPriceDeletedResponse,
  SubscriptionPlanUsersObject,
  SubscriptionPlanForUsersListResponse,
  SubscriptionPlanForAdminsListResponse,
  SubscriptionPlanAdminsObject,
} from "../responses/subscriptionPlan.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

// GET /subscription-plans for users
registry.registerPath({
  method: "get",
  path: "/subscription-plans",
  summary: "Get all subscription plans for users",
  tags: ["Subscription Plans"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: SubscriptionPlanForUsersListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /subscription-plans/admin for admins
registry.registerPath({
  method: "get",
  path: "/subscription-plans/admin",
  summary: "Get all subscription plans for admins",
  tags: ["Subscription Plans"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: SubscriptionPlanForAdminsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /subscription-plans/admin/{uid} for admins
registry.registerPath({
  method: "get",
  path: "/subscription-plans/admin/{uid}",
  summary: "Get subscription plan by UID for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Subscription Plans"],
  request: {
    params: SubscriptionPlanUidSchema,
  },
  responses: {
    200: SubscriptionPlanAdminsObject,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /subscription-plans/{uid} for users
registry.registerPath({
  method: "get",
  path: "/subscription-plans/{uid}",
  summary: "Get subscription plan by UID for users",
  security: [{ CookieAuth: [] }],
  tags: ["Subscription Plans"],
  request: {
    params: SubscriptionPlanUidSchema,
  },
  responses: {
    200: SubscriptionPlanUsersObject,
    400: BadRequest,
    500: ServerError,
  },
});

// POST /subscription-plans
registry.registerPath({
  method: "post",
  path: "/subscription-plans",
  summary: "Create a new subscription plan",
  tags: ["Subscription Plans"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: SubscriptionPlanCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: SubscriptionPlanCreatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// PATCH /subscription-plans
registry.registerPath({
  method: "patch",
  path: "/subscription-plans/admin/{uid}",
  summary: "Update a subscription plan",
  tags: ["Subscription Plans"],
  security: [{ CookieAuth: [] }],
  request: {
    params: SubscriptionPlanUidSchema,
    body: {
      content: {
        "application/json": {
          schema: SubscriptionPlanUpdateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SubscriptionPlanUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /subscription-plans
registry.registerPath({
  method: "delete",
  path: "/subscription-plans/admin/{uid}",
  summary: "Delete a subscription plan",
  tags: ["Subscription Plans"],
  security: [{ CookieAuth: [] }],
  request: {
    params: SubscriptionPlanUidSchema,
  },
  responses: {
    200: SubscriptionPlanDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /subscription-plans/admin/{planId}/prices/{priceId}
registry.registerPath({
  method: "delete",
  path: "/subscription-plans/admin/{planId}/prices/{priceId}",
  summary: "Delete a plan price",
  tags: ["Subscription Plans"],
  security: [{ CookieAuth: [] }],
  request: {
    params: PlanPriceParamsSchema,
  },
  responses: {
    200: PlanPriceDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
