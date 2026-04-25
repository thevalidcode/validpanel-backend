import express from "express";
import * as internals from "../controllers/internal.controllers";
import * as resellerStores from "../controllers/resellerStore.controllers";
import { authenticateInternalUser } from "../middleware/auth";

const router = express.Router();

router.get(
  "/subscription",
  authenticateInternalUser,
  internals.getSubscription,
);
router.get("/store", authenticateInternalUser, internals.getStore);
router.get("/reseller-stores", resellerStores.getResellerStores);
router.post("/reseller-stores", resellerStores.createResellerStoreRecord);

export default router;
