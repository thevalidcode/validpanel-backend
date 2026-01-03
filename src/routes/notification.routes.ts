import express from "express";
const router = express.Router();
import * as notifications from "../controllers/notification.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";
import {
  limitNotificationMarkAsRead,
  limitNotificationView,
} from "../middleware/ratelimit/notification.ratelimit";

/**
 * =========================
 * NOTIFICATION ROUTES (USER ROUTES)
 * =========================
 */
router.get("/me", authenticateUser, limitNotificationView, notifications.getMyNotification);
router.get(
  "/unread-count",
  authenticateUser,
  limitNotificationView,
  notifications.getUnreadNotificationCount
);
router.patch(
  "/:uid/mark-as-read",
  authenticateUser,
  limitNotificationMarkAsRead,
  notifications.markAsRead
);

/**
 * =========================
 * NOTIFICATION ROUTES (ADMIN ROUTES)
 * =========================
 */

router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_NOTIFICATIONS"]),
  limitNotificationView,
  notifications.getNotificationsForAdmins
);

export default router;
