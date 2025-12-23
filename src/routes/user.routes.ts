import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

router.post("/me", strictLimiter, users.me);
router.post("/verify-session", users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.post("/reset-password", strictLimiter, users.resetPassword);
router.post("/forgot-password", strictLimiter, users.forgotPassword);

// ✅ FIX: static route FIRST
router.get("/analytics", authenticateUser, users.userAnalytics);

// dynamic routes AFTER
router.get("/:uid", authenticateUser, users.getUserByUid);

router.patch("/", authenticateUser, users.updateUser);
router.delete("/", authenticateUser, users.deleteUser);

// User onboarding routes (authenticated users)
router.post("/onboarding/setup", authenticateUser, users.setupStore);

// Admin routes
router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_USERS"]),
  users.getUsers
);
router.delete(
  "/multiple",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_USERS"]),
  users.deleteUsers
);
router.patch(
  "/ban-multiple",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_USERS"]),
  users.banUsers
);
router.patch(
  "/activate-multiple",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_USERS"]),
  users.activateMultipleUsers
);

export default router;
