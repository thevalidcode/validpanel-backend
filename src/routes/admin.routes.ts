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
  updatePermission,
} from "../controllers/adminPermission.controllers";

import { authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";
import {
  limitAdminAuth,
  limitAdminPasswordOps,
  limitAdminCreate,
  limitAdminUpdate,
  limitAdminDelete,
  limitAdminView,
  limitRolePermissionCreate,
  limitRolePermissionUpdate,
  limitRolePermissionDelete,
} from "../middleware/ratelimit/admin.ratelimit";

const router = express.Router();

/**
 * =========================
 * AUTHENTICATION ROUTES
 * =========================
 */

router.post("/me", limitAdminAuth, admins.authenticateAdmin);
router.post("/forgot-password", limitAdminPasswordOps, admins.forgotPassword);
router.post("/reset-password", limitAdminPasswordOps, admins.resetPassword);
router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ADMINS"]),
  limitAdminView,
  admins.getAdmins
);
router.get(
  "/platform-events",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ADMINS"]),
  limitAdminView,
  admins.getPlatformEvents
);
router.put("/me", authenticateAdmin, limitAdminUpdate, admins.updateMe);
router.post(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ADMINS"]),
  limitAdminCreate,
  admins.createAdmin
);
router.put(
  "/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ADMINS"]),
  limitAdminUpdate,
  admins.updateAdmin
);
router.delete(
  "/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ADMINS"]),
  limitAdminDelete,
  admins.deleteAdmin
);
router.get(
  "/overview",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ADMINS_OVERVIEW"]),
  limitAdminView,
  admins.overview
);

/**
 * =========================
 * ROLE ROUTES
 * =========================
 */
router.post(
  "/roles",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  limitRolePermissionCreate,
  createRole
);

router.get(
  "/roles",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ROLES"]),
  limitAdminView,
  getRoles
);

router.get(
  "/roles/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_ROLES"]),
  limitAdminView,
  getRoleByUid
);

router.put(
  "/roles/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  limitRolePermissionUpdate,
  updateRole
);

router.delete(
  "/roles/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  limitRolePermissionDelete,
  deleteRole
);

// Assign Permission to Role
router.put(
  "/roles/:uid/permissions",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_ROLES"]),
  limitRolePermissionUpdate,
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
  limitRolePermissionCreate,
  createPermission
);

router.get(
  "/permissions",
  authenticateAdmin,
  checkAdminPermission(["VIEW_PERMISSIONS"]),
  limitAdminView,
  getPermissions
);

router.delete(
  "/permissions/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PERMISSIONS"]),
  limitRolePermissionDelete,
  deletePermission
);

router.patch(
  "/permissions/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_PERMISSIONS"]),
  limitRolePermissionUpdate,
  updatePermission
);

export default router;
