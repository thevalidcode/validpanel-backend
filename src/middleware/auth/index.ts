import { Request, Response, NextFunction } from "express";
import { verifyBrowserToken, verifyInternalUserAuth } from "./auth.shared";
import { prisma } from "../../config/db.config";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = verifyBrowserToken(req, res);
    if (!payload) return;
    const { email, apiKey, uid } = payload;

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user || user.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid user API key or not found" });
      return;
    }

    const {
      password,
      resetToken,
      resetTokenExpiry,
      spent,
      referralSource,
      marketingData,
      ...safeUser
    } = user;
    req.auth = {
      uid,
      type: "user",
      user: safeUser,
    };
    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateInternalUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = verifyInternalUserAuth(req, res);
    if (!payload) return;
    const { uid } = payload;

    const user = await prisma.user.findFirst({ where: { uid } });
    if (!user) {
      res.status(401).json({ error: "User not found." });
      return;
    }

    const {
      password,
      resetToken,
      resetTokenExpiry,
      spent,
      referralSource,
      marketingData,
      ...safeUser
    } = user;
    req.auth = {
      uid,
      type: "user",
      user: safeUser,
    };
    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = verifyBrowserToken(req, res);
    if (!payload) return;

    const { email, apiKey, uid } = payload;

    const admin = await prisma.admin.findFirst({
      where: { email },
      include: { role: true },
    });
    if (!admin || admin.apiKey !== apiKey) {
      res.status(401).json({ error: "Invalid admin API key or not found" });
      return;
    }

    const { password, resetToken, resetTokenExpiry, ...safeAdmin } = admin;

    req.auth = {
      uid,
      type: "admin",
      user: { ...safeAdmin, role: admin.role.name },
    };

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authenticateAnyone = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const payload = verifyBrowserToken(req, res);
  if (!payload) return;

  const { uid } = payload;

  try {
    const [user, admin] = await Promise.all([
      prisma.user.findFirst({ where: { uid } }),
      prisma.admin.findFirst({ where: { uid }, include: { role: true } }),
    ]);

    const account = admin || user;

    if (!account) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }

    if (admin) {
      const { password, resetToken, resetTokenExpiry, ...safeAdmin } = admin;
      req.auth = {
        type: "admin",
        uid,
        user: { ...safeAdmin, role: admin.role.name },
      };
    } else if (user) {
      const {
        password,
        resetToken,
        resetTokenExpiry,
        spent,
        referralSource,
        marketingData,
        ...safeUser
      } = user;
      req.auth = {
        type: "user",
        uid,
        user: safeUser,
      };
    }

    next();
  } catch (err: any) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
