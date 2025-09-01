import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import { tokenPayloadSchema } from "../../schemas/user.schema";
import { Decimal } from "@prisma/client/runtime/library";
import {
  UserPlan,
  UserStatus,
  AdminStatus,
} from "../../../prisma/generated";

declare module "express" {
  interface Request {
    auth?:
      | {
          type: "user";
          uid: string;
          user: {
            id: number;
            email: string;
            plan: UserPlan;
            status: UserStatus;
            apiKey: string;
            balance: Decimal;
          };
        }
      | {
          type: "admin";
          uid: string;
          user: {
            email: string;
            id: number;
            role: string;
            uid: string;
            apiKey: string;
            status: AdminStatus;
          };
        };
  }
}

export const verifyAuthToken = (req: Request, res: Response) => {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ error: "Missing auth or CSRF token" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const parsed = tokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return null;
    }

    return parsed.data;
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};
