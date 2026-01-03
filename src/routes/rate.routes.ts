import express from "express";
const router = express.Router();
import * as rates from "../controllers/rate.controllers";
import { limitRateView } from "../middleware/ratelimit/rate.ratelimit";

// Public routes
router.get("/", limitRateView, rates.getCurrentRates);

export default router;
