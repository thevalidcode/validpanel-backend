import express from "express";
const router = express.Router();
import * as settings from "../controllers/setting.controllers";
import { authenticateAdmin } from "../middleware/auth";
import {
  limitSettingsUpdate,
  limitSettingsView,
} from "../middleware/ratelimit/setting.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

router.get("/", limitSettingsView, settings.getSettingsForUsers);

// Admin routes
router.get("/admin", authenticateAdmin, limitSettingsView, settings.getSettingsForAdmins);
router.put(
  "/",
  authenticateAdmin,
  limitSettingsUpdate,
  checkAdminPermission(["MANAGE_SETTINGS"]),
  settings.updateSettings
);

export default router;
