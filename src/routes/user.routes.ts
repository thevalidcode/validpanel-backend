import express from "express";
const router = express.Router();
import * as users from "../controllers/user.controllers";
import { authenticateUser } from "../middleware/auth";
import { strictLimiter } from "../middleware/ratelimit/user.ratelimit";

router.get("/", authenticateUser, users.getUsers);
router.post("/me", strictLimiter, users.me);
router.post("/verify-session", users.verifySession);
router.post("/", strictLimiter, users.createUser);
router.get("/:uid", authenticateUser, users.getUserByUid);
router.patch("/", authenticateUser, users.updateUser);
router.delete("/", authenticateUser, users.deleteUser);
router.delete("/multiple", authenticateUser, users.deleteUsers);

export default router;
