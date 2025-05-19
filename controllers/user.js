const { getDocs, addDoc, addPanelDoc, updateDoc } = require("../crud");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../utils/email");

exports.userAuth = async (req, res) => {
  const { email, password } = req.body;
  const allUsers = getDocs("users");
  const userData = allUsers.find((user) => user.email === email);
  if (userData) {
    const isMatch = await bcrypt.compare(password, userData.password);
    if (isMatch) {
      return res.status(200).send(userData);
    } else {
      return res.status(400).send({ error: "Invalid Login Details" });
    }
  } else {
    return res.status(400).send({ error: "Invalid Login Details" });
  }
};

exports.userData = async (req, res) => {
  const { uid } = req.body;
  const allUsers = getDocs("users");
  const userData = allUsers.find((user) => user.uid === uid);
  if (userData) {
    return res.status(200).send(userData);
  } else {
    return res.status(400).send({ error: "Invalid Login Details" });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const uuid = uuidv4();
    const userData = {
      uid: uuid,
      email: email,
      name: name,
      timestamp: new Date(),
      password: password,
      apiKey: uuid,
      panelIds: [],
    };

    const usersDocs = getDocs("users");
    const emailExist = usersDocs.some((user) => user.email === email);
    if (emailExist) {
      return res.status(400).send({ error: "Email already exists" });
    }

    let userId;
    if (usersDocs.length === 0) {
      userId = 1;
    } else {
      const sortedUsers = usersDocs.sort((a, b) => b.id - a.id);
      userId = sortedUsers[0].id + 1;
    }
    userData.id = userId;

    const panelsDocs = getDocs("registeredPanels");
    let panelId;
    if (panelsDocs.length === 0) {
      panelId = 1;
    } else {
      const sortedPanels = panelsDocs.sort((a, b) => b.panelId - a.panelId);
      panelId = sortedPanels[0].panelId + 1;
    }

    while (usersDocs.some((user) => user.panelIds.includes(panelId))) {
      panelId++;
    }

    userData.panelIds.push(panelId);
    addDoc("users", userData);

    return res
      .status(200)
      .send({ user: userData, success: "User Created Successfully" });
  } catch (error) {
    return res.status(500).send({ error: "Error creating user" });
  }
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = getDocs("users", null, {
      find: { field: "email", operator: "===", value: email },
    });
    if (!user) {
      return res.status(400).send({ error: "User doesn't exist" });
    }
    function generatePassword(numWords, wordLength) {
      const characters = "abcdefghijklmnopqrstuvwxyz";
      return Array.from({ length: numWords }, () =>
        Array.from(
          { length: wordLength },
          () => characters[Math.floor(Math.random() * characters.length)]
        ).join("")
      ).join("-");
    }
    const newPassword = generatePassword(4, 6);
    await sendEmail(undefined, email, "forgetPassword", {
      name: user.name,
      random_password: newPassword,
    });
    updateDoc("users", user.uid, { password: newPassword });
    return res.status(200).send({ error: "Email sent successfully" });
  } catch (error) {
    return res.status(500).send({ error: "Error sending email" });
  }
};
