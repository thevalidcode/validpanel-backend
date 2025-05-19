require("dotenv").config();
const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const usersRouter = require("./routes/user");
const adminsRouter = require("./routes/admin");
const crudRouter = require("./routes/crud");
const { panel } = require("./utils/panel");
const cron = require("node-cron");
const fs = require("fs");
const { createSSL } = require("./utils/dns");
const PORT = 3002;

const env = process.env.NODE_ENV;

app.use(bodyParser.json());
app.use(cors());
app.use("/user", usersRouter);
app.use("/admin", adminsRouter);
app.use("/panel", panel);
app.use("/crud", crudRouter);

cron.schedule("0 */3 * * *", () => {
  createSSL();
});

if (env === "production") {
  const options = {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/validpanel.com-0002/privkey.pem"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/validpanel.com-0002/fullchain.pem"
    ),
  };
  const server = https.createServer(options, app);
  server.listen(PORT, () => {
    console.log(`Server running on https://validpanel.com:${PORT}/`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}/`);
  });
}
