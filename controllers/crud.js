const {
  getDocs,
  addDoc,
  addPanelDoc,
  addDocs,
  addPanelDocs,
  addSubDoc,
  addPanelSubDoc,
  addSubDocs,
  addPanelSubDocs,
  deleteDoc,
  deletePanelDoc,
  deleteDocs,
  deletePanelDocs,
  updateDoc,
  updatePanelDoc,
  deleteSubDocs,
  deleteSubDoc,
  updateSubDoc,
  updatePanelSubDoc,
  deletePanelSubDocs,
  deletePanelSubDoc,
} = require("../crud");

const authenticate = (key) => {
  const adminsCol = getDocs("admins");
  const usersCol = getDocs("users");
  const isAdmin = adminsCol.some((admin) => admin.apiKey === key);
  const isUser = usersCol.some((user) => user.apiKey === key);
  return isAdmin || isUser;
};

exports.getData = async (req, res) => {
  const { panelId, collection, key, query } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let data;
  if (panelId) {
    data = getDocs(collection, panelId, query);
  } else {
    data = getDocs(collection, query);
  }
  return res.status(200).send(data);
};

exports.addData = async (req, res) => {
  const { panelId, collection, data, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = addPanelDoc(collection, data, panelId);
  } else {
    response = addDoc(collection, data);
  }
  return res.status(200).send(response);
};

exports.deleteData = async (req, res) => {
  const { panelId, collection, uid, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  if (panelId) {
    deletePanelDoc(collection, uid, panelId);
  } else {
    deleteDoc(collection, uid);
  }
  return res.status(200).send({ success: "Deleted Successfully" });
};

exports.updateData = async (req, res) => {
  const { panelId, collection, uid, data, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  if (panelId) {
    updatePanelDoc(collection, uid, data, panelId);
  } else {
    updateDoc(collection, uid, data);
  }
  return res.status(200).send({ success: "Updated Successfully" });
};

// New handlers for additional functions
exports.addMultipleDocs = async (req, res) => {
  const { panelId, collection, data, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = addPanelDocs(collection, data, panelId);
  } else {
    response = addDocs(collection, data);
  }
  return res.status(200).send(response);
};

exports.addSubDocument = async (req, res) => {
  const { panelId, collection, subDocKey, data, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = addPanelSubDoc(collection, subDocKey, data, panelId);
  } else {
    response = addSubDoc(collection, subDocKey, data);
  }
  return res.status(200).send(response);
};

exports.addMultipleSubDocs = async (req, res) => {
  const { panelId, collection, subDocKey, data, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = addPanelSubDocs(collection, subDocKey, data, panelId);
  } else {
    response = addSubDocs(collection, subDocKey, data);
  }
  return res.status(200).send(response);
};

exports.deleteMultipleDocs = async (req, res) => {
  const { panelId, collection, uids, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = deletePanelDocs(collection, uids, panelId);
  } else {
    response = deleteDocs(collection, uids);
  }
  return res.status(200).send(response);
};

exports.deleteSubDocuments = async (req, res) => {
  const { panelId, collection, subDocKey, uids, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = deletePanelSubDocs(collection, subDocKey, uids, panelId);
  } else {
    response = deleteSubDocs(collection, subDocKey, uids);
  }
  return res.status(200).send(response);
};

exports.deleteSubDocument = async (req, res) => {
  const { panelId, collection, subDocKey, uid, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = deletePanelSubDoc(collection, subDocKey, uid, panelId);
  } else {
    response = deleteSubDoc(collection, subDocKey, uid);
  }
  return res.status(200).send(response);
};

exports.updateSubDocument = async (req, res) => {
  const { panelId, collection, subDocKey, uid, data, key } = req.body;
  if (!authenticate(key)) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panelId) {
    response = updatePanelSubDoc(collection, subDocKey, uid, data, panelId);
  } else {
    response = updateSubDoc(collection, subDocKey, uid, data);
  }
  return res.status(200).send(response);
};
