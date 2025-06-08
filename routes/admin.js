const express = require("express");
const router = express.Router();
const admin = require("../controllers/admin");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin authentication and data retrieval
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Admin login
 *     description: Authenticates an admin by verifying their email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@validplug.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 adminData:
 *                   type: object
 *       400:
 *         description: Incorrect Password or other login error
 */

/**
 * @swagger
 * /admin/data:
 *   post:
 *     tags: [Admin]
 *     summary: Get admin data by UID
 *     description: Fetches admin details using their UID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *             properties:
 *               uid:
 *                 type: string
 *                 example: a1b2c3d4
 *     responses:
 *       200:
 *         description: Admin data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 adminData:
 *                   type: object
 *       400:
 *         description: Error checking admin or UID missing
 */


router.post("/login", admin.login);
router.post("/data", admin.getAdminData);

module.exports = router;
