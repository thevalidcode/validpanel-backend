import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import { tokenPayloadSchema } from "../../schemas/user.schema";
import { Decimal } from "@prisma/client/runtime/client";
import { UserStatus, AdminStatus } from "../../../prisma/generated";
import { internalTokenPayloadSchema } from "../../schemas/auth.schema";

declare module "express" {
  interface Request {
    auth?:
      | {
          type: "user";
          uid: string;
          user: {
            id: number;
            email: string;
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

export const verifyBrowserToken = (req: Request, res: Response) => {
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

/**
 * 🔒 Internal User Authentication
 *
 * Used when the **social media store**, **shop** or another service
 * makes requests on behalf of a specific **user**.
 *
 * That user on the core platform is an admin to a specific store.
 *
 */
export const verifyInternalUserAuth = (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"] as string;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.INTERNAL_SERVICE_USER_JWT_SECRET);

    const parsed = internalTokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      res.status(401).json({ error: parsed.error.flatten() });
      return null;
    }

    return parsed.data;
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
    return null;
  }
};
