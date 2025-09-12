import { registry } from "../components/registry";
import {
  PaymentListResponse,
  PaymentPublicListResponse,
} from "../responses/payment.response";
import { BadRequest, ServerError } from "../responses/common.response";

registry.registerPath({
  method: "get",
  path: "/payments",
  summary: "Get a user's payments",
  tags: ["Payments"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PaymentPublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/payments/admin",
  summary: "Get all payments for admins",
  tags: ["Payments"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PaymentListResponse,
    400: BadRequest,
    500: ServerError,
  },
});
