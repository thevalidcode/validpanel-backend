import { env } from "./env.config";
import cors from "cors";

export const openCors = cors({ origin: true, credentials: true });

export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (env.NODE_ENV === "development") {
      return callback(null, true); // allow all origins in dev
    }

    if (
      origin === `https://validpanel.com` ||
      origin === `https://test.validpanel.com`
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
