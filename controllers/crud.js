const {
  getDocs,
  addDoc,
  addPanelDoc,
  addDocs,
  addPanelDocs,
  deleteDoc,
  deletePanelDoc,
  deleteDocs,
  deletePanelDocs,
  updateDoc,
  updatePanelDoc,
} = require("../crud");

const authenticate = async (key) => {
  const adminsCol = await getDocs("admins");
  const usersCol = await getDocs("users");
  const isAdmin = adminsCol.some((admin) => admin.api_key === key);
  const isUser = usersCol.some((user) => user.api_key === key);
  return isAdmin || isUser;
};

exports.getData = async (req, res) => {
  const { panel_id, collection, key, query } = req.body;
  if (!(await authenticate(key))) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let data;
  if (panel_id) {
    data = await getDocs(collection, panel_id, query);
  } else {
    data = await getDocs(collection, query);
  }
  return res.status(200).send(data);
};

exports.addData = async (req, res) => {
  const { panel_id, collection, data, key } = req.body;
  if (!(await authenticate(key))) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panel_id) {
    response = await addPanelDoc(collection, data, panel_id);
  } else {
    response = await addDoc(collection, data);
  }
  return res.status(200).send(response);
};

exports.deleteData = async (req, res) => {
  const { panel_id, collection, uid, key } = req.body;
  if (!(await authenticate(key))) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  if (panel_id) {
    await deletePanelDoc(collection, uid, panel_id);
  } else {
    await deleteDoc(collection, uid);
  }
  return res.status(200).send({ success: "Deleted Successfully" });
};

exports.updateData = async (req, res) => {
  const { panel_id, collection, uid, data, key } = req.body;
  if (!(await authenticate(key))) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  if (panel_id) {
    await updatePanelDoc(collection, uid, data, panel_id);
  } else {
    await updateDoc(collection, uid, data);
  }
  return res.status(200).send({ success: "Updated Successfully" });
};

exports.addMultipleDocs = async (req, res) => {
  const { panel_id, collection, data, key } = req.body;
  if (!(await authenticate(key))) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panel_id) {
    response = await addPanelDocs(collection, data, panel_id);
  } else {
    response = await addDocs(collection, data);
  }
  return res.status(200).send(response);
};

exports.deleteMultipleDocs = async (req, res) => {
  const { panel_id, collection, uids, key } = req.body;
  if (!(await authenticate(key))) {
    return res.status(400).send({ error: "Unauthorized Access" });
  }

  let response;
  if (panel_id) {
    response = await deletePanelDocs(collection, uids, panel_id);
  } else {
    response = await deleteDocs(collection, uids);
  }
  return res.status(200).send(response);
};
