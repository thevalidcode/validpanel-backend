import { env } from "./env.config";
import cors from "cors";
import { Request, Response, NextFunction } from "express";

const allowedOrigins = [
  `https://validpanel.com`,
  `https://www.validpanel.com`,
  `https://test.validpanel.com`,
  `https://auth.validpanel.com`,
  `https://www.test.validpanel.com`,
  `http://localhost:5173`
];

export const openCors = cors({ origin: true, credentials: true });

export const corsOptions = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  const authority = (req.headers[':authority'] || req.headers.host) as string | undefined;

  let allowOrigin: string | boolean = false;

  if (env.NODE_ENV === "development") {
    allowOrigin = true;
  } else if (origin && allowedOrigins.includes(origin)) {
    allowOrigin = origin;
  } else {
    // check authority
    if (authority) {
      const host = authority.split(':')[0];
      const allowed = allowedOrigins.find(o => {
        try {
          return new URL(o).host === host;
        } catch {
          return false;
        }
      });
      if (allowed) {
        allowOrigin = allowed;
      }
    }
  }

  if (allowOrigin) {
    cors({
      origin: allowOrigin,
      credentials: true,
      optionsSuccessStatus: 200
    })(req, res, next);
  } else {
    res.status(403).json({ error: "Not allowed by CORS" });
  }
};
