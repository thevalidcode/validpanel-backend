const express = require("express");
const router = express.Router();
const crud = require("../controllers/crud");

/**
 * @swagger
 * tags:
 *   name: CRUD
 *   description: General-purpose CRUD operations for both global and panel-specific collections
 */

/**
 * @swagger
 * /get/docs:
 *   post:
 *     tags: [CRUD]
 *     summary: Fetch documents from a collection
 *     description: Returns documents from a global or panel-specific collection. Requires an API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - key
 *             properties:
 *               collection:
 *                 type: string
 *                 example: orders
 *               panel_id:
 *                 type: integer
 *                 example: 2
 *               key:
 *                 type: string
 *                 example: YOUR_API_KEY
 *               query:
 *                 type: object
 *                 example: { status: "pending" }
 *     responses:
 *       200:
 *         description: Documents retrieved successfully
 *       400:
 *         description: Unauthorized Access
 */

/**
 * @swagger
 * /add/doc:
 *   post:
 *     tags: [CRUD]
 *     summary: Add a single document to a collection
 *     description: Adds a document to either a global or panel-specific collection. Requires an API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - data
 *               - key
 *             properties:
 *               collection:
 *                 type: string
 *                 example: products
 *               panel_id:
 *                 type: integer
 *                 example: 1
 *               data:
 *                 type: object
 *                 example: { name: "Item A", price: 100 }
 *               key:
 *                 type: string
 *                 example: YOUR_API_KEY
 *     responses:
 *       200:
 *         description: Document added successfully
 *       400:
 *         description: Unauthorized Access
 */

/**
 * @swagger
 * /update/doc:
 *   post:
 *     tags: [CRUD]
 *     summary: Update a document in a collection
 *     description: Updates a document in a global or panel-specific collection by UID. Requires an API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - uid
 *               - data
 *               - key
 *             properties:
 *               collection:
 *                 type: string
 *                 example: users
 *               panel_id:
 *                 type: integer
 *                 example: 3
 *               uid:
 *                 type: string
 *                 example: abc123
 *               data:
 *                 type: object
 *                 example: { name: "Updated Name" }
 *               key:
 *                 type: string
 *                 example: YOUR_API_KEY
 *     responses:
 *       200:
 *         description: Document updated successfully
 *       400:
 *         description: Unauthorized Access
 */

/**
 * @swagger
 * /delete/doc:
 *   post:
 *     tags: [CRUD]
 *     summary: Delete a document by UID
 *     description: Deletes a document from a collection by UID. Works with global or panel collections. Requires an API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - uid
 *               - key
 *             properties:
 *               collection:
 *                 type: string
 *                 example: users
 *               panel_id:
 *                 type: integer
 *                 example: 1
 *               uid:
 *                 type: string
 *                 example: xyz789
 *               key:
 *                 type: string
 *                 example: YOUR_API_KEY
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       400:
 *         description: Unauthorized Access
 */

/**
 * @swagger
 * /add/docs:
 *   post:
 *     tags: [CRUD]
 *     summary: Add multiple documents to a collection
 *     description: Adds multiple documents to a global or panel-specific collection. Requires an API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - data
 *               - key
 *             properties:
 *               collection:
 *                 type: string
 *                 example: inventory
 *               panel_id:
 *                 type: integer
 *                 example: 4
 *               data:
 *                 type: array
 *                 items:
 *                   type: object
 *                   example: { name: "Item B", stock: 50 }
 *               key:
 *                 type: string
 *                 example: YOUR_API_KEY
 *     responses:
 *       200:
 *         description: Documents added successfully
 *       400:
 *         description: Unauthorized Access
 */

/**
 * @swagger
 * /delete/docs:
 *   post:
 *     tags: [CRUD]
 *     summary: Delete multiple documents by UID
 *     description: Deletes multiple documents from a collection using an array of UIDs. Requires an API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collection
 *               - uids
 *               - key
 *             properties:
 *               collection:
 *                 type: string
 *                 example: users
 *               panel_id:
 *                 type: integer
 *                 example: 2
 *               uids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["id1", "id2"]
 *               key:
 *                 type: string
 *                 example: YOUR_API_KEY
 *     responses:
 *       200:
 *         description: Documents deleted successfully
 *       400:
 *         description: Unauthorized Access
 */

router.post("/get/docs", crud.getData);
router.post("/add/doc", crud.addData);
router.post("/delete/doc", crud.deleteData);
router.post("/update/doc", crud.updateData);
router.post("/add/docs", crud.addMultipleDocs);
router.post("/delete/docs", crud.deleteMultipleDocs);

module.exports = router;
