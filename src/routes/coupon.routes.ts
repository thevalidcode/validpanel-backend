import express from "express";
import { authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";
import * as coupons from "../controllers/coupon.controllers";

const router = express.Router();

router.get("/", coupons.listPublicCoupons);

router.get("/context", coupons.listPublicCouponsByContext);

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["VIEW_COUPONS"]),
  coupons.listCoupons,
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_COUPONS"]),
  coupons.getCouponByUid,
);

router.post(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_COUPONS"]),
  coupons.createCoupon,
);

router.patch(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_COUPONS"]),
  coupons.updateCoupon,
);

router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_COUPONS"]),
  coupons.deleteCoupon,
);

router.post("/validate", coupons.validateCoupon);

export default router;
