import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

router.post("/me", strictLimiter, users.me);
router.post("/verify-session", users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.get("/:uid", authenticateUser, users.getUserByUid);
router.patch("/", authenticateUser, users.updateUser);
router.delete("/", authenticateUser, users.deleteUser);
router.get("/dashboard/overview", authenticateUser, users.dashboardOverview);

// User onboarding routes (authenticated users)
router.post("/onboarding/select-plan", authenticateUser, users.selectPlan);
router.post(
  "/onboarding/initialize-payment",
  authenticateUser,
  users.initializeSubscriptionPayment
);
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

export default router;
