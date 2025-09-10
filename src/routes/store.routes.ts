import express from "express";
import * as stores from "../controllers/store.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limittActions,
  limittAdd,
} from "../middleware/ratelimit/common.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

router.get("/:uid", authenticateUser, stores.getStoreByUid);
router.post("/", authenticateUser, limittAdd, stores.createStore);
router.put("/:uid", authenticateUser, limittActions, stores.updateStore);
router.delete("/:uid", authenticateUser, limittActions, stores.deleteStore);
router.get("/my/stores", authenticateUser, stores.getMyStores);

/**
 *
 * ADMIN ROUTES FOR STORE MANAGEMENT
 *
 */

router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_STORES"]),
  stores.getActiveStores
);
router.get(
  "/admin/all",
  checkAdminPermission(["VIEW_STORES"]),
  authenticateAdmin,
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
  stores.approveStore
);
router.put(
  "/admin/:uid/suspend",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  stores.suspendStore
);
router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_STORES"]),
  stores.adminDeleteStore
);

export default router;
