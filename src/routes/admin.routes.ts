import express from "express";
import * as admins from "../controllers/admin.controllers"
;
import rateLimit from "express-rate-limit";
import { openCors } from "../config/cors.config";
const router = express.Router();

const strictLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
});

router.get("/login", openCors, admins.adminLogin);
router.post("/login", openCors, strictLimiter, admins.authenticateAdmin);
router.post("/logout", openCors, admins.logoutAdmin);

export default router;
