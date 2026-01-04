import express from "express";
import * as subscriptionPlans from "../controllers/subscriptionPlan.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitSubscriptionPlanCreate,
  limitSubscriptionPlanUpdate,
  limitSubscriptionPlanDelete,
  limitSubscriptionPlanView,
} from "../middleware/ratelimit/subscriptionPlan.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 * ADMIN ROUTES FOR SUBSCRIPTIONS PLANS
 */

router.patch(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTION_PLANS"]),
  limitSubscriptionPlanUpdate,
  subscriptionPlans.updateSubscriptionPlan
);

router.post(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTION_PLANS"]),
  limitSubscriptionPlanCreate,
  subscriptionPlans.addSubscriptionPlan
);

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SUBSCRIPTION_PLANS"]),
  limitSubscriptionPlanView,
  subscriptionPlans.getSubscriptionPlans
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SUBSCRIPTION_PLANS"]),
  limitSubscriptionPlanView,
  subscriptionPlans.getSubscriptionPlanByUid
);

router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SUBSCRIPTION_PLANS"]),
  limitSubscriptionPlanDelete,
  subscriptionPlans.deleteSubscriptionPlanByUid
);

/**
 * SUBSCRIPTIONS PLANS ROUTES FOR USERS AND ADMINS
 */

router.get(
  "/",
  limitSubscriptionPlanView,
  subscriptionPlans.getSubscriptionPlansForUser
);

router.get(
  "/:uid",
  limitSubscriptionPlanView,
  subscriptionPlans.getSubscriptionPlanByUidForUser
);

export default router;
