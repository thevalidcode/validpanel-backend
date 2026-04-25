import express from "express";
import * as reseller from "../controllers/reseller.controllers";
import { authenticateUser } from "../middleware/auth";
import {
  requireActiveSubscription,
  requireSubscriptionFeature,
} from "../middleware/subscription.middleware";
import {
  resellerReadRateLimit,
  resellerStartRateLimit,
  resellerSyncRateLimit,
} from "../middleware/ratelimit/reseller.ratelimit";

const router = express.Router();

router.get("/sources", resellerReadRateLimit, reseller.getSources);

router.get(
  "/shop/:supplierId/products",
  resellerReadRateLimit,
  reseller.getSourceProducts,
);

router.get(
  "/smm/:providerId/services",
  resellerReadRateLimit,
  reseller.getSourceServices,
);

router.post(
  "/start",
  authenticateUser,
  requireActiveSubscription,
  requireSubscriptionFeature("reselling"),
  resellerStartRateLimit,
  reseller.postStartReselling,
);

router.post(
  "/:targetStoreUid/sync",
  authenticateUser,
  requireActiveSubscription,
  requireSubscriptionFeature("reselling"),
  resellerSyncRateLimit,
  reseller.postSyncResellerStore,
);

export default router;
