import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/payment.controllers";

const router = express.Router();

router.get("/", authenticateUser, payments.getPaymentsForUsers);
router.get("/admin", authenticateAdmin, payments.getPaymentsForAdmins);

export default router;
