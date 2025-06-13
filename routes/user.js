const express = require("express");
const userRoutes = express.Router();
const user = require("../controllers/user");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints for user authentication and management
 */

/**
 * @swagger
 * /user/create:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Error creating user
 */

/**
 * @swagger
 * /user/auth:
 *   post:
 *     tags: [Users]
 *     summary: Authenticate user login
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
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid Login Details
 */

/**
 * @swagger
 * /user/data:
 *   post:
 *     tags: [Users]
 *     summary: Get user data by UID
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
 *                 example: d1a2b3c4-5678-90ab-cdef-1234567890ab
 *     responses:
 *       200:
 *         description: User data fetched successfully
 *       400:
 *         description: Invalid Login Details
 */

/**
 * @swagger
 * /user/forget-password:
 *   post:
 *     tags: [Users]
 *     summary: Reset user password and send new one via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: User doesn't exist
 *       500:
 *         description: Error sending email
 */

userRoutes.post("/create", user.createUser);
userRoutes.post("/auth", user.userAuth);
userRoutes.post("/data", user.userData);
userRoutes.post("/forget-password", user.forgetPassword);

module.exports = userRoutes;
