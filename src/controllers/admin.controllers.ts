import { prisma } from "../config/db.config";
import { env } from "../config/env.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import { AuthenticateAdminSchema } from "../schemas/admin.schema";
import { callInternalAPIForAdmins } from "../utils/internalApi";
import { NormalizedOrder } from "../types/order.types";
import { mapShopOrder, mapSocialOrder } from "../utils/mappers/order.mappers";

export const authenticateAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = AuthenticateAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const account = await prisma.admin.findFirst({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!account) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    if ("status" in account && account.status === "BANNED") {
      res.status(403).json({ error: "You’ve been banned. Contact support." });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    const apiKey = account.apiKey || uuidv4();
    const role = account.role.name;

    const token = jwt.sign({ email, apiKey, role }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: "Logged in successfully",
      role,
      user: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};

export const dashboardOverview = async (req: Request, res: Response) => {
  const { uid } = req.auth!;

  try {
    const [
      totalUsers,
      totalStores,
      activeStores,
      paymentAggregate,
      recentActivity,
      socialMediaStoreOrders,
      shopOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.store.count({
        where: { status: "ACTIVE" },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "SUCCESS" },
      }),
      prisma.notification.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
      }),
      callInternalAPIForAdmins("GET", `/orders?page=1&limit=20`, uid, "SOCIAL"),
      callInternalAPIForAdmins("GET", `/orders?page=1&limit=20`, uid, "SHOP"),
    ]);

    const normalizedSocial: NormalizedOrder[] =
      socialMediaStoreOrders.map(mapSocialOrder);
    const normalizedShop: NormalizedOrder[] = shopOrders.map(mapShopOrder);

    // Merge into one array
    const recentOrders: NormalizedOrder[] = [
      ...normalizedSocial,
      ...normalizedShop,
    ];
    res.status(200).json({
      totalUsers,
      totalStores,
      activeStores,
      totalRevenue: {
        currency: "USD",
        amount: paymentAggregate._sum.amount ?? 0,
      },
      recentOrders,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch dashboard overview" });
  }
};
