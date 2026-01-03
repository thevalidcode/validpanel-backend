import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/payment.controllers";
import { limitPaymentView } from "../middleware/ratelimit/payment.ratelimit";

const router = express.Router();

router.get("/", authenticateUser, limitPaymentView, payments.getPaymentsForUsers);
router.get("/admin", authenticateAdmin, limitPaymentView, payments.getPaymentsForAdmins);

export default router;
