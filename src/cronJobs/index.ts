import cron from "node-cron";
import { saveRates } from "../utils/rates";
import { processDueRenewals } from "./billing/processDueRenewals";
import { markStaleItemsFailed } from "./markStaleItems";

function startCronJobs() {
  cron.schedule("0 0,8,16 * * *", () => {
    saveRates();
  });

  cron.schedule("0 * * * *", () => {
    processDueRenewals();
  });

  cron.schedule("0 0 * * *", () => {
    markStaleItemsFailed();
  });
}

export { startCronJobs };
