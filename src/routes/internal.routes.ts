import express from "express";
import * as internals from "../controllers/internal.controllers";
import { authenticateInternalUser } from "../middleware/auth";

const router = express.Router();

router.get(
  "/subscription",
  authenticateInternalUser,
  internals.getSubscription,
);
router.get("/store", authenticateInternalUser, internals.getStore);

export default router;
