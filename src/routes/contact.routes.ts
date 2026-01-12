import express from "express";
import * as contact from "../controllers/contact.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitContactMessageCreate,
  limitContactMessageView,
  limitContactMessageUpdate,
  limitContactMessageDelete,
} from "../middleware/ratelimit/contact.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 * PUBLIC ROUTE FOR CONTACT FORM
 */
router.post(
  "/",
  limitContactMessageCreate,
  contact.createContactMessage
);

/**
 * ADMIN ROUTES FOR CONTACT MESSAGES
 */

// Get all contact messages (admin only)
router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["VIEW_CONTACT_MESSAGES"]),
  limitContactMessageView,
  contact.getContactMessages
);

// Get contact message by UID with all replies (admin only)
router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_CONTACT_MESSAGES"]),
  limitContactMessageView,
  contact.getContactMessageByUid
);

// Update contact message status (admin only)
router.patch(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_CONTACT_MESSAGES"]),
  limitContactMessageUpdate,
  contact.updateContactMessageStatus
);

// Delete contact message (admin only)
router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_CONTACT_MESSAGES"]),
  limitContactMessageDelete,
  contact.deleteContactMessage
);

/**
 * ADMIN ROUTES FOR CONTACT REPLIES
 */

// Get all replies for a contact message (admin only)
router.get(
  "/admin/:uid/replies",
  authenticateAdmin,
  checkAdminPermission(["VIEW_CONTACT_MESSAGES"]),
  limitContactMessageView,
  contact.getContactReplies
);

// Reply to contact message (admin only)
router.post(
  "/admin/:uid/reply",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_CONTACT_MESSAGES"]),
  limitContactMessageUpdate,
  contact.replyToContactMessage
);

// Get a specific contact reply by UID (admin only)
router.get(
  "/admin/replies/:replyUid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_CONTACT_MESSAGES"]),
  limitContactMessageView,
  contact.getContactReplyByUid
);

// Delete a contact reply (admin only)
router.delete(
  "/admin/replies/:replyUid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_CONTACT_MESSAGES"]),
  limitContactMessageDelete,
  contact.deleteContactReply
);

export default router;
