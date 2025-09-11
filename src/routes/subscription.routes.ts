import express from "express";
import * as subscriptions from "../controllers/subscription.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limittAdd,
  limittActions,
} from "../middleware/ratelimit/common.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 * SUBSCRIPTIONS ROUTES FOR USERS AND ADMINS
 */

router.get(
  "/",
  authenticateUser,
  limittActions,
  subscriptions.getSubscriptionsForUser
);

router.get(
  "/:uid",
  authenticateUser,
  limittActions,
  subscriptions.getSubscriptionByUidForUser
);

/**
 * ADMIN ROUTES FOR SUBSCRIPTIONS
 */

router.patch(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTIONS"]),
  limittActions,
  subscriptions.updateSubscription
);

router.post(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTIONS"]),
  limittAdd,
  subscriptions.addSubscription
);

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SUBSCRIPTIONS"]),
  limittActions,
  subscriptions.getSubscriptions
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SUBSCRIPTIONS"]),
  limittActions,
  subscriptions.getSubscriptionByUid
);

export default router;
