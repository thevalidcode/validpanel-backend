import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/transaction.controllers";
import { limitTransactionView } from "../middleware/ratelimit/transaction.ratelimit";

const router = express.Router();

router.get("", authenticateUser, limitTransactionView, payments.getTransactionsForUser);
router.get("/admin", authenticateAdmin, limitTransactionView, payments.getTransactionsForAdmin);

export default router;
