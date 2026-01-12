import { registry } from "../components/registry";
import {
  EmailLogUidSchema,
  EmailListQuerySchema,
} from "../../schemas/email.schema";

import {
  EmailLogListResponse,
  EmailLogObjectResponse,
  EmailLogDeletedResponse,
  EmailNotFoundResponse,
} from "../responses/email.response";
import {
  BadRequest,
  ServerError,
  Forbidden,
} from "../responses/common.response";

// GET /emails/admin - Get all email logs (admin only)
registry.registerPath({
  method: "get",
  path: "/emails/admin",
  summary: "Get all email logs with optional filters (admin only)",
  tags: ["Emails"],
  security: [{ CookieAuth: [] }],
  request: {
    query: EmailListQuerySchema,
  },
  responses: {
    200: EmailLogListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// GET /emails/admin/{uid} - Get email log by UID (admin only)
registry.registerPath({
  method: "get",
  path: "/emails/admin/{uid}",
  summary: "Get email log by UID (admin only)",
  tags: ["Emails"],
  security: [{ CookieAuth: [] }],
  request: {
    params: EmailLogUidSchema,
  },
  responses: {
    200: EmailLogObjectResponse,
    400: BadRequest,
    403: Forbidden,
    404: EmailNotFoundResponse,
    500: ServerError,
  },
});

// DELETE /emails/admin/{uid} - Delete email log (admin only)
registry.registerPath({
  method: "delete",
  path: "/emails/admin/{uid}",
  summary: "Delete email log (admin only)",
  tags: ["Emails"],
  security: [{ CookieAuth: [] }],
  request: {
    params: EmailLogUidSchema,
  },
  responses: {
    200: EmailLogDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
