import { registry } from "../components/registry";
import {
  ContactMessageCreateRequestSchema,
  ContactMessageUidSchema,
  ContactMessageUpdateStatusSchema,
} from "../../schemas/contact.schema";

import {
  ContactMessageCreatedResponse,
  ContactMessageListResponse,
  ContactMessageObjectResponse,
  ContactMessageUpdatedResponse,
  ContactMessageDeletedResponse,
  ContactMessageNotFoundResponse,
} from "../responses/contact.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

// POST /contact - Public endpoint to submit a contact message
registry.registerPath({
  method: "post",
  path: "/contact",
  summary: "Submit a contact message (public)",
  tags: ["Contact"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ContactMessageCreateRequestSchema,
        },
      },
    },
  },
  responses: {
    200: ContactMessageCreatedResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /contact/admin - Get all contact messages (admin only)
registry.registerPath({
  method: "get",
  path: "/contact/admin",
  summary: "Get all contact messages (admin only)",
  tags: ["Contact"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: ContactMessageListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// GET /contact/admin/{uid} - Get contact message by UID (admin only)
registry.registerPath({
  method: "get",
  path: "/contact/admin/{uid}",
  summary: "Get contact message by UID (admin only)",
  tags: ["Contact"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactMessageUidSchema,
  },
  responses: {
    200: ContactMessageObjectResponse,
    400: BadRequest,
    403: Forbidden,
    404: ContactMessageNotFoundResponse,
    500: ServerError,
  },
});

// PATCH /contact/admin/{uid} - Update contact message status (admin only)
registry.registerPath({
  method: "patch",
  path: "/contact/admin/{uid}",
  summary: "Update contact message status (admin only)",
  tags: ["Contact"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactMessageUidSchema,
    body: {
      content: {
        "application/json": {
          schema: ContactMessageUpdateStatusSchema,
        },
      },
    },
  },
  responses: {
    200: ContactMessageUpdatedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// DELETE /contact/admin/{uid} - Delete contact message (admin only)
registry.registerPath({
  method: "delete",
  path: "/contact/admin/{uid}",
  summary: "Delete contact message (admin only)",
  tags: ["Contact"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactMessageUidSchema,
  },
  responses: {
    200: ContactMessageDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
