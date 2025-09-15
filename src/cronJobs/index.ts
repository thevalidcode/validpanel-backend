import cron from "node-cron";
import { saveRates } from "../utils/rates";

function startCronJobs() {
  cron.schedule("0 0,8,16 * * *", () => {
    saveRates();
  });
}

export { startCronJobs };
