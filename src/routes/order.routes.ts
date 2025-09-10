import express from "express";
const router = express.Router();
import * as orders from "../controllers/order.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";

/**
 * =========================
 * ORDER ROUTES
 * =========================
 */

// Get all orders (Admin only, with pagination & filters)
router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ORDERS"]),
  orders.getAllOrders
);

// Get current user's orders (with pagination)
router.get("/me", authenticateUser, orders.getMyOrders);

export default router;
