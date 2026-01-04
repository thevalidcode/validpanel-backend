import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limitPaymentGatewayCreate,
  limitPaymentGatewayUpdate,
  limitPaymentGatewayDelete,
  limitPaymentGatewayView,
} from "../middleware/ratelimit/paymentGateway.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 *
 * ADMIN ROUTES FOR PAYMENT GATEWAYS
 *
 */

router.patch(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limitPaymentGatewayUpdate,
  paymentGateways.updatePaymentGateway
);

router.delete(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limitPaymentGatewayDelete,
  paymentGateways.deletePaymentGateway
);

router.post(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limitPaymentGatewayCreate,
  paymentGateways.addPaymentGateway
);

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limitPaymentGatewayView,
  paymentGateways.getPaymentGateways
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_PAYMENT_GATEWAYS"]),
  limitPaymentGatewayView,
  paymentGateways.getPaymentGatewayByUid
);

/**
 *
 * USER ROUTES FOR PAYMENT GATEWAYS
 *
 */

router.get(
  "/",
  authenticateUser,
  limitPaymentGatewayView,
  paymentGateways.getPaymentGatewaysForUser
);

router.get(
  "/:uid",
  authenticateUser,
  limitPaymentGatewayView,
  paymentGateways.getPaymentGatewayByUidForUser
);
export default router;
