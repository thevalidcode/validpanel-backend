import { prisma } from "../config/db.config";
import { env } from "../config/env.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import {
  AuthenticateAdminSchema,
  createAdminRequestSchema,
  UidSchema,
  updateAdminSchema,
} from "../schemas/admin.schema";

const formatCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const percentageChange = (current: number, previous: number) => {
  if (previous === 0) return { value: 0, up: true };
  const diff = ((current - previous) / previous) * 100;
  return {
    value: Number(diff.toFixed(2)),
    up: diff >= 0,
  };
};

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
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!account) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    if (account.status === "BANNED") {
      res.status(403).json({ error: "You’ve been banned. Contact support." });
      return;
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect login details" });
      return;
    }

    const apiKey = account.apiKey || uuidv4();
    const uid = account.uid;

    const token = jwt.sign({ email, apiKey, uid }, env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await prisma.platformEvent.create({
      data: {
        event: "ADMIN_LOGIN",
        category: "ADMIN",
        entityUid: account.uid,
        adminId: account.id,
      },
    });

    const { password: _, ...safeAdmin } = account;
    res.status(200).json({
      success: "Logged in successfully",
      role: account.role.name,
      admin: safeAdmin,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Login failed " + err.message });
  }
};

export const overview = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    /* ---------------------------------------
       BASIC COUNTS & REVENUE
    ---------------------------------------- */

    const [
      activeUsersLastMonth,
      activeUsersThisMonth,
      activeSubscriptions,
      revenueThisMonth,
      revenueLastMonth,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          timestamp: { lte: endOfLastMonth },
        },
      }),

      prisma.user.count({
        where: {
          timestamp: { lte: now },
        },
      }),

      prisma.subscription.count({
        where: { status: "ACTIVE" },
      }),

      prisma.payment.aggregate({
        _sum: { chargedAmount: true },
        where: {
          status: "SUCCESS",
          createdAt: { gte: startOfMonth },
        },
      }),

      prisma.payment.aggregate({
        _sum: { chargedAmount: true },
        where: {
          status: "SUCCESS",
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
    ]);

    const currentRevenue = Number(revenueThisMonth._sum.chargedAmount ?? 0);
    const previousRevenue = Number(revenueLastMonth._sum.chargedAmount ?? 0);

    const revenueChange = percentageChange(currentRevenue, previousRevenue);
    const userChange = percentageChange(
      activeUsersThisMonth,
      activeUsersLastMonth
    );

    /* ---------------------------------------
       CONVERSION RATE
    ---------------------------------------- */

    const signupsThisMonth = await prisma.user.count({
      where: { timestamp: { gte: startOfMonth } },
    });

    const convertedUsers = await prisma.subscription.count({
      where: {
        status: "ACTIVE",
        startedAt: { gte: startOfMonth },
      },
    });

    const conversionRate =
      signupsThisMonth === 0
        ? 0
        : Number(((convertedUsers / signupsThisMonth) * 100).toFixed(2));

    /* ---------------------------------------
       STAT CARDS (DIRECT UI MAPPING)
    ---------------------------------------- */

    const stats = [
      {
        title: "Total Revenue",
        value: formatCurrency(currentRevenue),
        change: `${revenueChange.up ? "+" : ""}${
          revenueChange.value
        }% from last month`,
        up: revenueChange.up,
      },
      {
        title: "Active Users",
        value: activeUsersThisMonth.toLocaleString(),
        change: `${userChange.up ? "+" : ""}${
          userChange.value
        }% from last month`,
        up: userChange.up,
      },
      {
        title: "Conversion Rate",
        value: `${conversionRate}%`,
        change: "-2.1% from last week",
        up: conversionRate >= 0,
      },
      {
        title: "Active Subscriptions",
        value: activeSubscriptions.toLocaleString(),
        change: "+3 from last month",
        up: true,
      },
    ];

    /* ---------------------------------------
       REVENUE CHART (MONTHLY)
    ---------------------------------------- */

    const paymentsByMonth = await prisma.payment.groupBy({
      by: ["createdAt"],
      _sum: { chargedAmount: true },
      where: { status: "SUCCESS" },
    });

    const monthlyRevenue = Array(12).fill(0);

    paymentsByMonth.forEach((p) => {
      const month = new Date(p.createdAt).getMonth();
      monthlyRevenue[month] += Number(p._sum.chargedAmount ?? 0);
    });

    const revenueChart = {
      labels: months,
      data: monthlyRevenue,
    };

    /* ---------------------------------------
       SUBSCRIPTION HEALTH
    ---------------------------------------- */

    const churnedThisMonth = await prisma.subscription.count({
      where: {
        status: "CANCELED",
        updatedAt: { gte: startOfMonth },
      },
    });

    const churnRate =
      activeSubscriptions === 0
        ? 0
        : Number(((churnedThisMonth / activeSubscriptions) * 100).toFixed(2));

    const arpu =
      activeSubscriptions === 0
        ? 0
        : Number((currentRevenue / activeSubscriptions).toFixed(2));

    const subscriptionHealth = {
      mrrGrowth: {
        value: `${revenueChange.value}%`,
        up: revenueChange.up,
      },
      churnRate: {
        value: `${churnRate}%`,
      },
      arpu: {
        value: formatCurrency(arpu),
      },
      netRevenueRetention: {
        value: "118%",
      },
    };

    /* ---------------------------------------
       RECENT ACTIVITY
    ---------------------------------------- */

    const recentActivities = await prisma.platformEvent.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const activities = recentActivities.map((e) => ({
      name: e.user?.fullName ?? "System",
      img: e.user?.image,
      message: e.event.replace(/_/g, " ").toLowerCase(),
      time: e.createdAt,
    }));

    /* ---------------------------------------
       TOP SUBSCRIPTIONS
    ---------------------------------------- */

    const topSubscriptionsRaw = await prisma.subscription.groupBy({
      by: ["planId"],
      _count: { planId: true },
      where: { status: "ACTIVE" },
      orderBy: { _count: { planId: "desc" } },
      take: 3,
    });

    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        id: { in: topSubscriptionsRaw.map((s) => s.planId) },
      },
    });

    const topSubscriptions = plans.map((plan) => {
      const count =
        topSubscriptionsRaw.find((s) => s.planId === plan.id)?._count.planId ??
        0;

      return {
        planName: plan.name,
        billingCycle: plan.interval,
        subscribers: count,
        revenue: formatCurrency(count * Number(plan.price)),
        isTrending: count > 500,
      };
    });

    /* ---------------------------------------
       FINAL RESPONSE
    ---------------------------------------- */

    res.status(200).json({
      stats,
      revenueChart,
      subscriptionHealth,
      recentActivities: activities,
      topSubscriptions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await prisma.admin.findMany({
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
    res.status(200).json(admins);
  } catch {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
};

export const getPlatformEvents = async (req: Request, res: Response) => {
  try {
    const platformEvents = await prisma.platformEvent.findMany({
      include: {
        user: true,
        admin: true,
      },
      take: 10,
    });
    res.status(200).json(platformEvents);
  } catch {
    res.status(500).json({ error: "Failed to fetch platform-events" });
  }
};

export const updateAdmin = async (req: Request, res: Response) => {
  const parsed = updateAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const paramsParsed = UidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }
  const { uid } = paramsParsed.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { uid },
    });

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const account = await prisma.admin.update({
      where: { uid },
      data: {
        ...parsed.data,
      },
    });

    await prisma.platformEvent.create({
      data: {
        event: "ADMIN_UPDATED",
        category: "ADMIN",
        entityUid: account.uid,
        adminId: account.id,
      },
    });

    res.status(200).json({ success: "Admin updated successfully" });
  } catch {
    res.status(500).json({ error: "Failed to update admin" });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const paramsParsed = UidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }
  const { uid } = paramsParsed.data;

  try {
    const admin = await prisma.admin.findUnique({
      where: { uid },
    });

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const account = await prisma.admin.delete({
      where: { uid },
    });

    await prisma.platformEvent.create({
      data: {
        event: "ADMIN_DELETED",
        category: "ADMIN",
        entityUid: account.uid,
        adminId: account.id,
      },
    });

    res.status(200).json({ success: "Admin deleted successfully" });
  } catch {
    res.status(500).json({ error: "Failed to delete admin" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  const parsed = updateAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = req.auth!;

  try {
    const admin = await prisma.admin.findUnique({
      where: { uid },
    });

    if (!admin) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }

    const account = await prisma.admin.update({
      where: { uid },
      data: {
        ...parsed.data,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    await prisma.platformEvent.create({
      data: {
        event: "ADMIN_UPDATE",
        category: "ADMIN",
        entityUid: account.uid,
        adminId: account.id,
      },
    });

    res
      .status(200)
      .json({ success: "Admin updated successfully", admin: account });
  } catch {
    res.status(500).json({ error: "Failed to update admin" });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  const parsed = createAdminRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const account = await prisma.admin.create({
      data: {
        ...parsed.data,
        password: await bcrypt.hash(parsed.data.password, 10),
        apiKey: uuidv4(),
      },
    });

    await prisma.platformEvent.create({
      data: {
        event: "ADMIN_LOGIN",
        category: "ADMIN",
        entityUid: account.uid,
        adminId: account.id,
      },
    });

    res.status(200).json({ success: "Admin created successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create admin" + error.message });
  }
};
