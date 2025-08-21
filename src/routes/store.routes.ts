import express from "express";
import * as stores from "../controllers/store.controllers";
import { authenticateAdmin, authenticateUser } from "../middleware/auth";
import {
  limittActions,
  limittAdd,
} from "../middleware/ratelimit/common.ratelimit";

const router = express.Router();

router.get("/:uid", authenticateUser, stores.getStoreByUid);
router.post("/", authenticateUser, limittAdd, stores.createStore);
router.put("/:uid", authenticateUser, limittActions, stores.updateStore);
router.delete("/:uid", authenticateUser, limittActions, stores.deleteStore);
router.get("/my/stores", authenticateUser, stores.getMyStores);

router.get("/", authenticateAdmin, stores.getStores);
router.get("/admin/all", authenticateAdmin, stores.adminGetAllStores);
router.get("/admin/:uid", authenticateAdmin, stores.adminGetStoreByUid);
router.put("/admin/:uid/approve", authenticateAdmin, stores.approveStore);
router.put("/admin/:uid/suspend", authenticateAdmin, stores.suspendStore);
router.delete("/admin/:uid", authenticateAdmin, stores.adminDeleteStore);

export default router;
