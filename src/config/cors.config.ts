import { env } from "./env.config";
import cors from "cors";
import type { Request } from "express";

export const openCors = cors({ origin: true, credentials: true });

// Dynamic CORS that checks request method
export const dynamicCors = (req: Request, res: any, next: any) => {
  const corsConfig = {
    origin: (origin: string | undefined, callback: Function) => {
      // Allow all GET requests regardless of origin
      if (req.method === "GET") {
        return callback(null, true);
      }

      if (env.NODE_ENV === "development") {
        return callback(null, true);
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

  cors(corsConfig)(req, res, next);
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
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
