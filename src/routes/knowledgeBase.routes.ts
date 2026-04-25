import express from "express";
import * as knowledgeBase from "../controllers/knowledgeBase.controllers";
import { authenticateAdmin } from "../middleware/auth";
import { checkAdminPermission } from "../middleware/permission";
import {
  limitKnowledgeBaseCreate,
  limitKnowledgeBaseDelete,
  limitKnowledgeBaseUpdate,
  limitKnowledgeBaseView,
} from "../middleware/ratelimit/knowledgeBase.ratelimit";

const router = express.Router();

// Admin routes
router.get(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SETTINGS"]),
  limitKnowledgeBaseView,
  knowledgeBase.getKnowledgeBaseForAdmin,
);

router.get(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SETTINGS"]),
  limitKnowledgeBaseView,
  knowledgeBase.getKnowledgeBaseByUidForAdmin,
);

router.post(
  "/admin",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SETTINGS"]),
  limitKnowledgeBaseCreate,
  knowledgeBase.createKnowledgeBaseForAdmin,
);

router.patch(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SETTINGS"]),
  limitKnowledgeBaseUpdate,
  knowledgeBase.updateKnowledgeBaseForAdmin,
);

router.delete(
  "/admin/:uid",
  authenticateAdmin,
  checkAdminPermission(["MANAGE_SETTINGS"]),
  limitKnowledgeBaseDelete,
  knowledgeBase.deleteKnowledgeBaseForAdmin,
);

// Public routes
router.get(
  "/",
  limitKnowledgeBaseView,
  knowledgeBase.getKnowledgeBaseForPublic,
);
router.get(
  "/:slug",
  limitKnowledgeBaseView,
  knowledgeBase.getKnowledgeBaseArticleBySlug,
);

export default router;
