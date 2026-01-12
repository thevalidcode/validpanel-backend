import express from "express";
import * as email from "../controllers/email.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitEmailLogView,
  limitEmailLogDelete,
} from "../middleware/ratelimit/email.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 * ADMIN ROUTES FOR EMAIL LOGS
 */

// Get all email logs (admin only)
router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["VIEW_EMAIL_LOGS"]),
  limitEmailLogView,
  email.getEmailLogs
);

// Get email log by UID (admin only)
router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_EMAIL_LOGS"]),
  limitEmailLogView,
  email.getEmailLogByUid
);

// Delete email log (admin only)
router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_EMAILS"]),
  limitEmailLogDelete,
  email.deleteEmailLog
);

export default router;
