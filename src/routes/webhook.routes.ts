import express from "express";
import * as webhooks from "../controllers/webhook.controllers";
import { limitWebhook } from "../middleware/ratelimit/webhook.ratelimit";

const router = express.Router();

router.post("/flutterwave", limitWebhook, webhooks.flutterwaveWebhook);
router.post("/paystack", limitWebhook, webhooks.paystackWebhook);

export default router;
