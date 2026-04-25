import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";
const noopLimiter = (_req: any, _res: any, next: any) => next();

export const resellerReadRateLimit = isDev
  ? noopLimiter
  : rateLimit({
      windowMs: 5 * 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 429,
        error: "Too many reseller read requests. Please try again later.",
      },
    });

export const resellerStartRateLimit = isDev
  ? noopLimiter
  : rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 429,
        error: "Too many start-reselling requests. Please try again later.",
      },
    });

export const resellerSyncRateLimit = isDev
  ? noopLimiter
  : rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        status: 429,
        error: "Too many sync requests. Please try again later.",
      },
    });
