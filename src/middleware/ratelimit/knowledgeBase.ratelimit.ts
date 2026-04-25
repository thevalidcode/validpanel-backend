import rateLimit from "express-rate-limit";
import { devBypass } from "./utils";

export const limitKnowledgeBaseCreate = devBypass(
  rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 30,
    message: "Too many knowledge base create attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const limitKnowledgeBaseUpdate = devBypass(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 120,
    message: "Too many knowledge base update attempts. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const limitKnowledgeBaseDelete = devBypass(
  rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 30,
    message: "Too many knowledge base delete attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const limitKnowledgeBaseView = devBypass(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200,
    message: "Too many knowledge base requests. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
