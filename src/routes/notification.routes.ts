import express from "express";
const router = express.Router();
import * as notifications from "../controllers/notification.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";

/**
 * =========================
 * NOTIFICATION ROUTES (USER ROUTES)
 * =========================
 */
router.get("/me", authenticateUser, notifications.getMyNotification);

/**
 * =========================
 * NOTIFICATION ROUTES (ADMIN ROUTES)
 * =========================
 */

router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_NOTIFICATIONS"]),
  notifications.getNotificationsForAdmins
);

export default router;
