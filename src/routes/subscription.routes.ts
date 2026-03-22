import express from "express";
import * as subscriptions from "../controllers/subscription.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limitSubscriptionCreate,
  limitPlanUpgrade,
  limitPlanDowngrade,
  limitSubscriptionRenew,
  limitSubscriptionView,
  limitSubscriptionUpdate,
} from "../middleware/ratelimit/subscription.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 * ADMIN ROUTES FOR SUBSCRIPTIONS
 */

router.patch(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTIONS"]),
  limitSubscriptionUpdate,
  subscriptions.updateSubscription
);

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SUBSCRIPTIONS"]),
  limitSubscriptionView,
  subscriptions.getSubscriptions
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SUBSCRIPTIONS"]),
  limitSubscriptionView,
  subscriptions.getSubscriptionByUid
);

/**
 * SUBSCRIPTIONS ROUTES FOR USERS AND ADMINS
 */

router.get(
  "/",
  authenticateUser,
  limitSubscriptionView,
  subscriptions.getCurrentSubscriptionsForUser
);

router.get(
  "/active",
  authenticateUser,
  limitSubscriptionView,
  subscriptions.getActiveSubscriptionForUser
);

router.patch(
  "/upgrade-plan",
  authenticateUser,
  limitPlanUpgrade,
  subscriptions.upgradePlan
);

router.patch(
  "/downgrade-plan",
  authenticateUser,
  limitPlanDowngrade,
  subscriptions.downgradePlan
);

router.post(
  "/",
  authenticateUser,
  limitSubscriptionCreate,
  subscriptions.createSubscription
);
router.post(
  "/renew",
  authenticateUser,
  limitSubscriptionRenew,
  subscriptions.renewSubscription
);

router.get(
  "/:uid",
  authenticateUser,
  limitSubscriptionView,
  subscriptions.getSubscriptionByUidForUser
);

export default router;
