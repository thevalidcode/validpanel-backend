import { registry } from "../components/registry";
import {
  FlutterwaveWebhookSchema,
  PaystackWebhookSchema,
} from "../../schemas/webhook.schema";
import {
  BadRequest,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";

// POST /webhooks/flutterwave
registry.registerPath({
  method: "post",
  path: "/webhooks/flutterwave",
  summary: "Flutterwave webhook",
  tags: ["Webhooks"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: FlutterwaveWebhookSchema,
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

// POST /webhooks/paystack
registry.registerPath({
  method: "post",
  path: "/webhooks/paystack",
  summary: "Paystack webhook",
  tags: ["Webhooks"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: PaystackWebhookSchema,
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
