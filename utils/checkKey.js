const { getDocs } = require("../crud");

const checkKey = (key) => {
  const adminsCol = getDocs("admins");
  const usersCol = getDocs("users");
  const isAdmin = adminsCol.some((admin) => admin.apiKey === key);
  const isUser = usersCol.some((user) => user.apiKey === key);
  return isAdmin || isUser;
};

module.exports = { checkKey };
