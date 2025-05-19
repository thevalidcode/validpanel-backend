const express = require("express");
const panel = express.Router();
const {
  getDocs,
  addPanelDoc,
  addDoc,
  updateDoc,
  getPanelCollectionPath,
  readData,
  addPanelDocs,
} = require("../crud");
const { createServer } = require("./dns");
const { checkKey } = require("./checkKey");

panel.post("/getId", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  const users = getDocs("users");
  const user = users.find((user) => user.uid === uid);

  if (user) {
    res.status(200).send({ id: user.panelIds[0] });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

panel.post("/get/orders", async (req, res) => {
  const { key } = req.body;
  if (!checkKey(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }
  const collection = getPanelCollectionPath("orders");
  const panelOrders = readData(collection).orders;
  const combinedArray = [];

  for (const key in panelOrders) {
    if (panelOrders.hasOwnProperty(key)) {
      const orders = panelOrders[key].map((order) => ({
        ...order,
        panelId: parseInt(key),
      }));
      combinedArray.push(...orders);
    }
  }
  return res.status(200).send(combinedArray);
});

panel.post("/get/users", async (req, res) => {
  const { key } = req.body;
  if (!checkKey(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }
  const collection = getPanelCollectionPath("users");
  const panelUsers = readData(collection).users;
  const combinedArray = [];

  for (const key in panelUsers) {
    if (panelUsers.hasOwnProperty(key)) {
      const users = panelUsers[key].map((user) => ({
        ...user,
        panelId: parseInt(key),
      }));
      combinedArray.push(...users);
    }
  }
  return res.status(200).send(combinedArray);
});

panel.post("/get", async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  const registeredPanels = getDocs("registeredPanels");
  const panels = registeredPanels.filter((panel) =>
    panel.userUids.includes(uid)
  );

  const panelData = panels.map((panel) => ({
    value: panel.panelId,
    label: panel.uid,
  }));

  res.status(200).send(panelData);
});

panel.post("/checkuser", async (req, res) => {
  const { uid, panelId } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "Missing uid" });
  }

  try {
    const users = getDocs("users");
    const foundUser = users.some(
      (user) => user.uid === uid && user.panelIds.includes(parseInt(panelId))
    );

    res.status(200).json({ success: foundUser });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

panel.post("/create", async (req, res) => {
  const { domain, panelId, uid } = req.body;

  if (!domain) {
    return res.status(400).json({ error: "Missing domain" });
  }

  const lowerCaseDomain = domain.toLowerCase();
  let mainPanelId = panelId ? panelId : 0;

  if (!panelId) {
    const users = getDocs("users");
    const user = [...users].find((user) => user.uid === uid);

    if (user) {
      const panels = getDocs("registeredPanels");
      const latestPanel = panels.sort((a, b) => b.panelId - a.panelId)[0];
      mainPanelId = latestPanel
        ? String(parseInt(latestPanel.panelId) + 1)
        : "1";
      const panelIds = user.panelIds.push(parseInt(mainPanelId));
      while (
        users.some((user) => user.panelIds.includes(parseInt(mainPanelId)))
      ) {
        parseInt(mainPanelId)++;
      }
      updateDoc("users", uid, { panelIds: panelIds });
    }
  }
  const siteData = {
    uid: "site",
    title: "Panel",
    showBanner: true,
    defaultCurrency: {
      label: "USD - United States Dollar",
      value: "1",
    },
  };
  const designData = {
    adminstyles: {
      "--adbasebgcolor": "#24003d",
      "--adbaseactcolor": "#2f0050",
      "--adbasehvcolor": "rgb(71, 3, 119)",
      "--addarkbgcolor": "#1a0029",
      "--adtextbgcolor": "rgb(163, 141, 179)",
      "--sitecolor": "#fb95ff",
    },
    clientStyles: {
      "--bgdarkcolor": "#1c031a",
      "--bglightcolor": "#f6eff3",
      "--sitecolor": "#6a0083",
      "--stbaseactcolor": "#aa19d2",
      "--stbasebgcolor": "#b46bd6",
      "--stbasehvcolor": "#d123c3",
      "--sttextbgcolor": "#c58cc0",
      "--sitecolor": "#fb95ff",
    },
    uid: "design",
  };
  const user = getDocs("users", null, {
    find: { field: "uid", operator: "===", value: uid },
  });
  const adminData = {
    uid: user.uid,
    apiKey: user.uid,
    email: user.email,
    password: user.password,
    timestamp: user.timestamp,
    name: user.name,
  };
  const homeData = {
    title: "The Best SMM Panel",
    uid: "home",
    tutorial: ""
  };
  const providerData = {
    url: "validplug.com.ng",
    percentage: 100,
    key: "39cdc01d-49ec-40c0-8dd2-42990c8d22d3",
    sync: null,
    id: 1
  };
  const notificationData = [
    {
      uid: "admin_emails",
      emails: [`${user.email
      }`]
    },
    {
      uid: "email_templates",
      newUser: "",
      newService: "",
      newOrder: "",
      fundsAdded: "",
      newMessage: "",
      verificationCode: "",
      newSupport: ""
    }
  ]

  addPanelDoc("general", siteData, parseInt(mainPanelId));
  addPanelDoc("admins", adminData, parseInt(mainPanelId));
  addPanelDoc("pages", homeData, parseInt(mainPanelId));
  addPanelDoc("design", designData, parseInt(mainPanelId));
  addPanelDoc("providers", providerData, parseInt(mainPanelId));
  addPanelDocs("notifications", notificationData, parseInt(mainPanelId));

  const registeredPanelData = {
    panelId: parseInt(mainPanelId),
    ssl: false,
    uid: lowerCaseDomain,
    userUids: [uid],
    timestamp: new Date(),
  };
  addDoc("registeredPanels", registeredPanelData);
  createServer(lowerCaseDomain, mainPanelId, res);
});

module.exports = { panel };
