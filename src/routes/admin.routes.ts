import express from "express";
import * as admins from "../controllers/admin.controllers";
import {
  createRole,
  getRoles,
  getRoleByUid,
  updateRole,
  deleteRole,
  assignPermissionToRole,
} from "../controllers/adminRole.controllers";
import {
  createPermission,
  getPermissions,
  deletePermission,
} from "../controllers/adminPermission.controllers";

import { authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

router.post("/me", admins.authenticateAdmin);
router.get("/dashboard/overview", authenticateAdmin, admins.dashboardOverview);

/**
 * =========================
 * ROLE ROUTES
 * =========================
 */
router.post(
  "/roles",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  createRole
);

router.get(
  "/roles",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ROLES"]),
  getRoles
);

router.get(
  "/roles/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ROLES"]),
  getRoleByUid
);

router.put(
  "/roles/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  updateRole
);

router.delete(
  "/roles/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  deleteRole
);

// Assign Permission to Role
router.put(
  "/roles/:uid/permissions",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  assignPermissionToRole
);

/**
 * =========================
 * PERMISSION ROUTES
 * =========================
 */
router.post(
  "/permissions",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PERMISSIONS"]),
  createPermission
);

router.get(
  "/permissions",
  authenticateAdmin,
  checkAdminPermission(["VIEW_PERMISSIONS"]),
  getPermissions
);

router.delete(
  "/permissions/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PERMISSIONS"]),
  deletePermission
);

export default router;
