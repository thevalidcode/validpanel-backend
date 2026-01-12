import { registry } from "../components/registry";
import {
  ContactMessageCreateRequestSchema,
  ContactMessageUidSchema,
  ContactMessageUpdateStatusSchema,
  ContactMessageReplySchema,
  ContactReplyUidSchema,
} from "../../schemas/contact.schema";

import {
  ContactMessageCreatedResponse,
  ContactMessageListResponse,
  ContactMessageWithRepliesResponse,
  ContactMessageUpdatedResponse,
  ContactMessageDeletedResponse,
  ContactMessageNotFoundResponse,
  ContactMessageReplyResponse,
  ContactReplyListResponse,
  ContactReplyObjectResponse,
  ContactReplyNotFoundResponse,
  ContactReplyDeletedResponse,
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
  summary: "Get all contact messages with reply count (admin only)",
  tags: ["Contact"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: ContactMessageListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

// GET /contact/admin/{uid} - Get contact message by UID with all replies (admin only)
registry.registerPath({
  method: "get",
  path: "/contact/admin/{uid}",
  summary: "Get contact message by UID with all replies (admin only)",
  description: "Returns the contact message along with all replies in chronological order",
  tags: ["Contact"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactMessageUidSchema,
  },
  responses: {
    200: ContactMessageWithRepliesResponse,
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

// ============================================
// CONTACT REPLY ENDPOINTS
// ============================================

// GET /contact/admin/{uid}/replies - Get all replies for a contact message (admin only)
registry.registerPath({
  method: "get",
  path: "/contact/admin/{uid}/replies",
  summary: "Get all replies for a contact message (admin only)",
  description: "Returns all replies for a specific contact message in chronological order",
  tags: ["Contact Replies"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactMessageUidSchema,
  },
  responses: {
    200: ContactReplyListResponse,
    400: BadRequest,
    403: Forbidden,
    404: ContactMessageNotFoundResponse,
    500: ServerError,
  },
});

// POST /contact/admin/{uid}/reply - Reply to contact message (admin only)
registry.registerPath({
  method: "post",
  path: "/contact/admin/{uid}/reply",
  summary: "Reply to contact message via email (admin only)",
  description: "Sends a reply email to the contact with proper email threading headers (In-Reply-To and References). The reply is stored as a ContactReply and the contact message status is updated to REPLIED.",
  tags: ["Contact Replies"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactMessageUidSchema,
    body: {
      content: {
        "application/json": {
          schema: ContactMessageReplySchema,
        },
      },
    },
  },
  responses: {
    200: ContactMessageReplyResponse,
    400: BadRequest,
    403: Forbidden,
    404: ContactMessageNotFoundResponse,
    500: ServerError,
  },
});

// GET /contact/admin/replies/{replyUid} - Get a specific contact reply by UID (admin only)
registry.registerPath({
  method: "get",
  path: "/contact/admin/replies/{replyUid}",
  summary: "Get a specific contact reply by UID (admin only)",
  tags: ["Contact Replies"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactReplyUidSchema,
  },
  responses: {
    200: ContactReplyObjectResponse,
    400: BadRequest,
    403: Forbidden,
    404: ContactReplyNotFoundResponse,
    500: ServerError,
  },
});

// DELETE /contact/admin/replies/{replyUid} - Delete a contact reply (admin only)
registry.registerPath({
  method: "delete",
  path: "/contact/admin/replies/{replyUid}",
  summary: "Delete a contact reply (admin only)",
  tags: ["Contact Replies"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ContactReplyUidSchema,
  },
  responses: {
    200: ContactReplyDeletedResponse,
    400: BadRequest,
    403: Forbidden,
    404: ContactReplyNotFoundResponse,
    500: ServerError,
  },
});
