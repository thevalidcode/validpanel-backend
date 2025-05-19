const { getDocs } = require("../crud");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const adminDocs = getDocs("admins");
    const adminData = adminDocs.find((admin) => admin.email === email);
    const isMatch = await bcrypt.compare(password, adminData.password);
    if (isMatch) {
      return res.status(200).send({ adminData: adminData });
    } else {
      return res.status(400).send({ error: "Incorrect Password" });
    }
  } catch (error) {
    return res.status(400).send({ error: error.message });
  }
};

exports.getAdminData = async (req, res) => {
  const { uid } = req.body;
  if (!uid) {
    return res.status(400).send({ error: "No UID" });
  }
  try {
    const adminDocs = getDocs("admins");
    const adminData = adminDocs.find((admin) => admin.uid === uid);
    return res.status(200).send({ adminData: adminData });
  } catch (error) {
    return res.status(400).send({ error: "Error checking admin" });
  }
};
