import express from "express";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import * as payments from "../controllers/transaction.controllers";

const router = express.Router();

router.get("", authenticateUser, payments.getTransactionsForUser);
router.get("/admin", authenticateAdmin, payments.getTransactionsForAdmin);

export default router;
