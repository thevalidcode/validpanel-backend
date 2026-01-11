import { env } from "./env.config";
import cors from "cors";

export const openCors = cors({ origin: true, credentials: true });

export const corsOptions = {
  origin: (origin: string | undefined, callback: Function, req?: any) => {
    // Allow all GET requests regardless of origin
    if (req && req.method === "GET") {
      return callback(null, true);
    }

    if (env.NODE_ENV === "development") {
      return callback(null, true); // allow all origins in dev
    }

    if (
      origin === `https://validpanel.com` ||
      origin === `https://www.validpanel.com` ||
      origin === `https://test.validpanel.com` ||
      origin === `https://auth.validpanel.com` ||
      origin === `https://www.test.validpanel.com` ||
      origin === `http://localhost:5173`
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
