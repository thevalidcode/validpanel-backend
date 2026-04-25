import express from "express";
import * as resellerStores from "../controllers/resellerStore.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["VIEW_STORES"]),
  resellerStores.getAdminResellerStores,
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_STORES"]),
  resellerStores.getAdminResellerStoreByUid,
);

router.post(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  resellerStores.createResellerStoreRecord,
);

router.patch(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  resellerStores.updateAdminResellerStore,
);

router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  resellerStores.deleteAdminResellerStore,
);

export default router;
