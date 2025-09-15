import http from "http";
import app from "./app";
import { env } from "./config/env.config";
import { startCronJobs } from "./cronJobs";

const mainServer = http.createServer(app);

startCronJobs();

mainServer.listen(env.PORT, () => {
  const url =
    env.NODE_ENV === "production"
      ? `http://validpanel.com:${env.PORT}`
      : `http://localhost:${env.PORT}`;
  console.log(`Server running on ${url}`);
});
