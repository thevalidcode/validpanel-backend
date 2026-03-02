import express from "express";
import * as stores from "../controllers/store.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limitStoreCreate,
  limitStoreUpdate,
  limitStoreDelete,
  limitStoreAdminAction,
} from "../middleware/ratelimit/store.ratelimit";
import { checkAdminPermission } from "../middleware/permission";
import {
  checkStoreCreationLimit,
  requireActiveOrGracePeriodSubscription,
} from "../middleware/subscription.middleware";

const router = express.Router();

router.get("/me", authenticateUser, stores.getMyStores);
router.get("/:uid", authenticateUser, stores.getStoreByUid);
router.post(
  "/",
  authenticateUser,
  checkStoreCreationLimit,
  limitStoreCreate,
  stores.createStore
);
router.put(
  "/:uid",
  authenticateUser,
  requireActiveOrGracePeriodSubscription,
  limitStoreUpdate,
  stores.updateStore
);
router.delete(
  "/:uid",
  authenticateUser,
  requireActiveOrGracePeriodSubscription,
  limitStoreDelete,
  stores.deleteStore
);

/**
 *
 * ADMIN ROUTES FOR STORE MANAGEMENT
 *
 */

router.get(
  "/admin/active",
  authenticateAdmin,
  checkAdminPermission(["VIEW_STORES"]),
  stores.getActiveStores
);
router.get(
  "/admin/stats",
  authenticateAdmin,
  checkAdminPermission(["VIEW_STORES"]),
  stores.getStoreStats
);
router.get(
  "/admin/all",
  authenticateAdmin,
  checkAdminPermission(["VIEW_STORES"]),
  stores.adminGetAllStores
);
router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_STORES"]),
  stores.adminGetStoreByUid
);
router.put(
  "/admin/:uid/approve",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  limitStoreAdminAction,
  stores.approveStore
);
router.put(
  "/admin/:uid/pause",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  limitStoreAdminAction,
  stores.pauseStore
);
router.put(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  limitStoreUpdate,
  stores.adminUpdateStore
);
router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  limitStoreDelete,
  stores.adminDeleteStore
);

export default router;
