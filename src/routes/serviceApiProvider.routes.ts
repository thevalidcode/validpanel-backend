import express from "express";
import {
  createServiceProvider,
  getAllServiceProviders,
  getServiceProviderByUid,
  updateServiceProvider,
  updateServiceProviderStatus,
  deleteServiceProvider,
} from "../controllers/serviceApiProvider.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";

const router = express.Router();

// Create new provider
router.post(
  "/",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  createServiceProvider
);

// Get active providers (with filters, pagination)
router.get("/active", getAllServiceProviders);

// Get all providers (with filters, pagination)
router.get(
  "/",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SERVICE_API_PROVIDERS"]),
  getAllServiceProviders
);

// Get provider by UID
router.get(
  "/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SERVICE_API_PROVIDERS"]),
  getServiceProviderByUid
);

// Update provider details
router.put(
  "/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  updateServiceProvider
);

// Update provider status
router.patch(
  "/:uid/status",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  updateServiceProviderStatus
);

// Delete provider
router.delete(
  "/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  deleteServiceProvider
);

export default router;
