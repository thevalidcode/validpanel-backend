import express from "express";
import * as paymentGateways from "../controllers/paymentGateway.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limittAdd,
  limittActions,
} from "../middleware/ratelimit/common.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

router.get(
  "/",
  authenticateUser,
  limittActions,
  paymentGateways.getPaymentGatewaysForUser
);

router.get(
  "/:id",
  authenticateUser,
  limittActions,
  paymentGateways.getPaymentGatewayByUidForUser
);

/**
 *
 * ADMIN ROUTES FOR PAYMENT GATEWAYS
 *
 */


router.patch(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limittActions,
  paymentGateways.updatePaymentGateway
);

router.delete(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limittActions,
  paymentGateways.deletePaymentGateway
);

router.post(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limittAdd,
  paymentGateways.addPaymentGateway
);

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PAYMENT_GATEWAYS"]),
  limittActions,
  paymentGateways.getPaymentGateways
);

router.get(
  "/admin/:id",
  authenticateAdmin,
  checkAdminPermission(["VIEW_PAYMENT_GATEWAYS"]),
  limittActions,
  paymentGateways.getPaymentGatewayByUid
);
export default router;
