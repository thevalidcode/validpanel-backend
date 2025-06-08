require("dotenv").config();
const https = require("https");
const fs = require("fs");
const { startCronJobs } = require("./cronJobs");
const PORT = 3002;
const app = require("./app");
const { importDataFromFolder } = require("./transferdb");

const env = process.env.NODE_ENV;

startCronJobs();

// importDataFromFolder()

if (env === "production") {
  const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/validpanel.com/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/validpanel.com/fullchain.pem"),
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
