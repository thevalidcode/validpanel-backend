const express = require("express");
const panel = express.Router();
const {
  getDocs,
  addPanelDoc,
  addDoc,
  updateDoc,
  addPanelDocs,
} = require("../crud");
const { createServer } = require("../utils/dns");
const { checkKey } = require("../utils/checkKey");
const { vsp_pool } = require("../db");

/**
 * @swagger
 * tags:
 *   name: Panel
 *   description: Endpoints related to panel operations and data
 */

/**
 * @swagger
 * /panel/getId:
 *   post:
 *     tags: [Panel]
 *     summary: Get panel ID from user UID
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
 *                 example: user123
 *     responses:
 *       200:
 *         description: Panel ID retrieved
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /panel/get/orders:
 *   post:
 *     tags: [Panel]
 *     summary: Get all panel orders
 *     description: Retrieves all orders grouped by their panel IDs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: your-api-key
 *     responses:
 *       200:
 *         description: Orders retrieved
 *       400:
 *         description: Unauthorized Access
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /panel/get/users:
 *   post:
 *     tags: [Panel]
 *     summary: Get all panel users
 *     description: Retrieves all users grouped by panel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *                 example: your-api-key
 *     responses:
 *       200:
 *         description: Users retrieved
 *       400:
 *         description: Unauthorized Access
 *       500:
 *         description: Server Error
 */

/**
 * @swagger
 * /panel/get:
 *   post:
 *     tags: [Panel]
 *     summary: Get registered panels for a user
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
 *                 example: user123
 *     responses:
 *       200:
 *         description: Registered panels retrieved
 *       400:
 *         description: Missing UID
 */

/**
 * @swagger
 * /panel/checkuser:
 *   post:
 *     tags: [Panel]
 *     summary: Check if user belongs to a panel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - panel_id
 *             properties:
 *               uid:
 *                 type: string
 *               panel_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Result returned
 *       400:
 *         description: Missing UID
 *       500:
 *         description: Internal error
 */

/**
 * @swagger
 * /panel/create:
 *   post:
 *     tags: [Panel]
 *     summary: Create a new panel
 *     description: Assigns a new panel to a user and initializes data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *               - uid
 *             properties:
 *               domain:
 *                 type: string
 *                 example: mystore.com
 *               panel_id:
 *                 type: number
 *                 example: 2
 *               uid:
 *                 type: string
 *                 example: user123
 *     responses:
 *       200:
 *         description: Panel created successfully
 *       400:
 *         description: Missing domain or other validation error
 */

panel.post("/getId", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  const users = await getDocs("users");
  const user = users.find((user) => user.uid === uid);

  if (user) {
    res.status(200).send({ id: user.panel_ids[0] });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

panel.post("/get/orders", async (req, res) => {
  const { key } = req.body;

  if (!checkKey(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  try {
    const panelIdsResult = await vsp_pool.query(
      `SELECT DISTINCT panel_id FROM orders`
    );
    const panel_ids = panelIdsResult.rows.map((row) => row.panel_id);

    const combinedArray = [];

    for (const panel_id of panel_ids) {
      const ordersResult = await vsp_pool.query(
        `SELECT * FROM orders WHERE panel_id = $1`,
        [panel_id]
      );
      const orders = ordersResult.rows.map((order) => ({
        ...order,
        panel_id,
      }));
      combinedArray.push(...orders);
    }

    return res.status(200).send(combinedArray);
  } catch (err) {
    console.error("Failed to get orders:", err);
    return res.status(500).send({ error: "Server Error" });
  }
});

panel.post("/get/users", async (req, res) => {
  const { key } = req.body;

  if (!checkKey(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  try {
    const panelIdsResult = await vsp_pool.query(
      `SELECT DISTINCT panel_id FROM users`
    );
    const panel_ids = panelIdsResult.rows.map((row) => row.panel_id);

    const combinedArray = [];

    for (const panel_id of panel_ids) {
      const usersResult = await vsp_pool.query(
        `SELECT * FROM users WHERE panel_id = $1`,
        [panel_id]
      );
      const users = usersResult.rows.map((user) => ({
        ...user,
        panel_id,
      }));
      combinedArray.push(...users);
    }

    return res.status(200).send(combinedArray);
  } catch (err) {
    console.error("Failed to get users:", err);
    return res.status(500).send({ error: "Server Error" });
  }
});

panel.post("/get", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  const registeredPanels = await getDocs("registered_panels");
  const panels = registeredPanels.filter((panel) =>
    panel.user_uids.includes(uid)
  );

  const panelData = panels.map((panel) => ({
    value: panel.panel_id,
    label: panel.uid,
  }));

  res.status(200).send(panelData);
});

panel.post("/checkuser", async (req, res) => {
  const { uid, panel_id } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    const users = await getDocs("users");
    const foundUser = users.some(
      (user) => user.uid === uid && user.panel_ids.includes(parseInt(panel_id))
    );

    res.status(200).json({ success: foundUser });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

panel.post("/create", async (req, res) => {
  const { domain, panel_id, uid } = req.body;

  if (!domain) {
    return res.status(400).json({ error: "Missing domain" });
  }

  const lowerCaseDomain = domain.toLowerCase();
  let mainPanelId = panel_id ? parseInt(panel_id) : 0;

  if (!panel_id) {
    const users = await getDocs("users");
    const user = [...users].find((user) => user.uid === uid);

    if (user) {
      const panels = await getDocs("registered_panels");
      const latestPanel = panels.sort((a, b) => b.panel_id - a.panel_id)[0];
      let newPanelId = latestPanel ? latestPanel.panel_id + 1 : 1;

      // Ensure the new panel ID is unique
      while (
        users.some(
          (user) =>
            Array.isArray(user.panel_ids) && user.panel_ids.includes(newPanelId)
        )
      ) {
        newPanelId++;
      }

      mainPanelId = newPanelId;
      user.panel_ids = user.panel_ids || [];
      user.panel_ids.push(newPanelId);
      await updateDoc("users", uid, { panel_ids: user.panel_ids });
    }
  }

  const siteData = {
    uid: "site",
    title: "Panel",
    show_banner: true,
    default_currency: {
      label: "USD - United States Dollar",
      value: "1",
    },
  };

  const designData = {
    client_styles: {
      "--sitecolor": "#6a0083",
      "--stbaseactcolor": "#aa19d2",
      "--stbasebgcolor": "#b46bd6",
      "--stbasehvcolor": "#d123c3",
      "--sttextbgcolor": "#c58cc0",
      "--sitecolor": "#fb95ff",
    },
    uid: "design",
  };

  const user = await getDocs("users", null, {
    find: { field: "uid", operator: "===", value: uid },
  });

  const adminData = {
    uid: user.uid,
    api_key: user.uid,
    email: user.email,
    password: user.password,
    timestamp: user.timestamp,
    name: user.name,
  };

  const homeData = {
    title: "The Best SMM Panel",
    uid: "home",
    tutorial: "",
  };

  const providerData = {
    url: "validplug.com.ng",
    percentage: 100,
    key: "39cdc01d-49ec-40c0-8dd2-42990c8d22d3",
    sync: null,
    id: 1,
  };

  const notificationData = [
    {
      uid: "admin_emails",
      emails: [user.email],
    },
    {
      uid: "email_templates",
      new_user: "",
      new_service: "",
      new_order: "",
      funds_added: "",
      new_message: "",
      verification_code: "",
      new_support: "",
    },
  ];

  await addPanelDoc("general", siteData, mainPanelId);
  await addPanelDoc("admins", adminData, mainPanelId);
  await addPanelDoc("pages", homeData, mainPanelId);
  await addPanelDoc("design", designData, mainPanelId);
  await addPanelDoc("providers", providerData, mainPanelId);
  await addPanelDocs("notifications", notificationData, mainPanelId);

  const registeredPanelData = {
    panel_id: mainPanelId,
    ssl: false,
    uid: lowerCaseDomain,
    user_uids: [uid],
    timestamp: new Date(),
  };

  await addDoc("registered_panels", registeredPanelData);

  createServer(lowerCaseDomain, mainPanelId, res);
});

module.exports = { panel };
