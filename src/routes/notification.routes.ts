import express from "express";
const router = express.Router();
import * as notifications from "../controllers/notification.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";
import { limittAdd } from "../middleware/ratelimit/common.ratelimit";

/**
 * =========================
 * NOTIFICATION ROUTES (USER ROUTES)
 * =========================
 */
router.get("/me", authenticateUser, notifications.getMyNotification);
router.get(
  "/unread-count",
  authenticateUser,
  notifications.getUnreadNotificationCount
);
router.patch(
  "/:uid/mark-as-read",
  authenticateUser,
  limittAdd,
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
  notifications.getNotificationsForAdmins
);

export default router;
