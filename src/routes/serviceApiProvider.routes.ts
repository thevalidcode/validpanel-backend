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
  "/service-api-providers",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  createServiceProvider
);

// Get all providers (with filters, pagination)
router.get(
  "/service-api-providers",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SERVICE_API_PROVIDERS"]),
  getAllServiceProviders
);

// Get provider by UID
router.get(
  "/service-api-providers/:uid",
  authenticateAdmin,
  checkAdminPermission(["VIEW_SERVICE_API_PROVIDERS"]),
  getServiceProviderByUid
);

// Update provider details
router.put(
  "/service-api-providers/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  updateServiceProvider
);

// Update provider status
router.patch(
  "/service-api-providers/:uid/status",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  updateServiceProviderStatus
);

// Delete provider
router.delete(
  "/service-api-providers/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SERVICE_API_PROVIDERS"]),
  deleteServiceProvider
);

export default router;
