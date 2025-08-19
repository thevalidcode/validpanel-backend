import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateUser, authenticateAdmin } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";

router.get("/", authenticateAdmin, users.getUsers);
router.post("/me", strictLimiter, users.me);
router.post("/verify-session", users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.get("/:uid", authenticateUser, users.getUserByUid);
router.patch("/", authenticateUser, users.updateUser);
router.delete("/", authenticateUser, users.deleteUser);
router.delete("/multiple", authenticateAdmin, users.deleteUsers);

export default router;
