import http from "http";
import app from "./app";
import { env } from "./config/env.config";

const mainServer = http.createServer(app);

mainServer.listen(env.PORT, () => {
  const url =
    env.NODE_ENV === "production"
      ? `http://validpanel.com:${env.PORT}`
      : `http://localhost:${env.PORT}`;
  console.log(`Server running on ${url}`);
});
