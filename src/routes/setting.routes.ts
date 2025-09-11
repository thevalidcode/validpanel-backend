import express from "express";
const router = express.Router();
import * as settings from "../controllers/setting.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { limittActions } from "../middleware/ratelimit/common.ratelimit";
import { checkAdminPermission } from "../middleware/permission";

router.get("/", settings.getSettingsForUsers);

// Admin routes
router.get("/admin", authenticateAdmin, settings.getSettingsForAdmins);
router.put(
  "/",
  authenticateAdmin,
  limittActions,
  checkAdminPermission(["MANAGE_SETTINGS"]),
  settings.updateSettings
);

export default router;
