import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";
import {
  limitLogin,
  limitPasswordReset,
  limitForgotPassword,
  limitSessionVerify,
} from "../middleware/ratelimit/auth.ratelimit";
import { checkAdminPermission } from "../middleware/permission";
import { limitStoreCreate } from "../middleware/ratelimit";
import { checkStoreCreationLimit } from "../middleware/subscription.middleware";

router.post("/me", limitLogin, users.me);
router.post("/verify-session", limitSessionVerify, users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.post("/reset-password", limitPasswordReset, users.resetPassword);
router.post("/forgot-password", limitForgotPassword, users.forgotPassword);

// ✅ FIX: static route FIRST
router.get("/analytics", authenticateUser, users.userAnalytics);

// dynamic routes AFTER
router.get("/:uid", authenticateUser, users.getUserByUid);

router.patch("/", authenticateUser, users.updateUser);
router.delete("/", authenticateUser, users.deleteUser);

// User onboarding routes (authenticated users)
router.post(
  "/onboarding/setup",
  authenticateUser,
  checkStoreCreationLimit,
  limitStoreCreate,
  users.setupStore,
);
router.patch("/tour/complete", authenticateUser, users.completeTour);

// Admin routes
router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_USERS"]),
  users.getUsers,
);
router.delete(
  "/multiple",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_USERS"]),
  users.deleteUsers,
);
router.patch(
  "/ban-multiple",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_USERS"]),
  users.banUsers,
);
router.patch(
  "/activate-multiple",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_USERS"]),
  users.activateMultipleUsers,
);

export default router;
