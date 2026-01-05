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

// Get contact message by UID (admin only)
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

export default router;
