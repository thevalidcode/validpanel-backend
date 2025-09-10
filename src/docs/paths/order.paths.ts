import { registry } from "../components/registry";
import {
  GetAllOrdersRequestSchema,
  GetMyOrdersRequestSchema,
} from "../../schemas/order.schema";
import {
  GetAllStoreOrdersResponse,
  GetAStoreOrdersResponse,
} from "../responses/order.response";
import { BadRequest, ServerError } from "../responses/common.response";

/**
 * =========================
 * ORDERS ROUTES
 * =========================
 */

// Get orders for all stores with pagination for admins
registry.registerPath({
  method: "get",
  path: "/orders",
  summary: "Get orders for all stores with pagination for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Orders"],
  request: {
    query: GetAllOrdersRequestSchema,
  },
  responses: {
    200: GetAllStoreOrdersResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Get orders for a specific store with pagination for users
registry.registerPath({
  method: "get",
  path: "/orders/me",
  summary: "Get orders for a specific store with pagination for users",
  security: [{ CookieAuth: [] }],
  tags: ["Orders"],
  request: {
    params: GetMyOrdersRequestSchema,
  },
  responses: {
    200: GetAStoreOrdersResponse,
    400: BadRequest,
    404: {
      description: "No order found",
    },
    500: ServerError,
  },
});
