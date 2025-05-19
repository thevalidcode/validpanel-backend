const express = require("express");
const router = express.Router();
const crud = require("../controllers/admin");

router.post("/login", crud.login);
router.post("/data", crud.getAdminData);

module.exports = router;
