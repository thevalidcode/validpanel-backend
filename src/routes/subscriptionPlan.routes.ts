import express from "express";
import * as subscriptionPlans from "../controllers/subscriptionPlan.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limittAdd,
  limittActions,
} from "../middleware/ratelimit/common.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 * SUBSCRIPTIONS PLANS ROUTES FOR USERS AND ADMINS
 */

router.get(
  "/",
  authenticateUser,
  limittActions,
  subscriptionPlans.getSubscriptionPlansForUser
);

router.get(
  "/:uid",
  authenticateUser,
  limittActions,
  subscriptionPlans.getSubscriptionPlanByUidForUser
);

/**
 * ADMIN ROUTES FOR SUBSCRIPTIONS PLANS
 */

router.patch(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTION_PLANS"]),
  limittActions,
  subscriptionPlans.updateSubscriptionPlan
);

router.post(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTION_PLANS"]),
  limittAdd,
  subscriptionPlans.addSubscriptionPlan
);

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTION_PLANS"]),
  limittActions,
  subscriptionPlans.getSubscriptionPlans
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SUBSCRIPTION_PLANS"]),
  limittActions,
  subscriptionPlans.getSubscriptionPlanByUid
);

router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTION_PLANS"]),
  limittActions,
  subscriptionPlans.deleteSubscriptionPlanByUid
);

export default router;
