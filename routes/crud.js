const express = require("express");
const router = express.Router();
const crud = require("../controllers/crud");

router.post("/get/docs", crud.getData);
router.post("/add/doc", crud.addData);
router.post("/delete/doc", crud.deleteData);
router.post("/update/doc", crud.updateData);
router.post("/add/docs", crud.addMultipleDocs);
router.post("/add/sub/doc", crud.addSubDocument);
router.post("/add/sub/docs", crud.addMultipleSubDocs);
router.post("/delete/docs", crud.deleteMultipleDocs);
router.post("/delete/sub/doc", crud.deleteSubDocument);
router.post("/delete/sub/docs", crud.deleteSubDocuments);
router.post("/update/sub/doc", crud.updateSubDocument);

module.exports = router;
