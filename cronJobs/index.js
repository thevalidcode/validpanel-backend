const cron = require("node-cron");
const { createSSL } = require("../utils/dns");

function startCronJobs() {
  cron.schedule("0 */3 * * *", () => {
    createSSL();
  });
}

module.exports = { startCronJobs };
