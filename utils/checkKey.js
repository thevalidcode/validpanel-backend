const { getDocs } = require("../crud");

const checkKey = async (key) => {
  const adminsCol = await getDocs("admins");
  const usersCol = await getDocs("users");
  const isAdmin = adminsCol.some((admin) => admin.api_key === key);
  const isUser = usersCol.some((user) => user.api_key === key);
  return isAdmin || isUser;
};

module.exports = { checkKey };
