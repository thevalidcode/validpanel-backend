import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { env } from "../config/env.config";
import {
  AuthSchema,
  createUserRequestSchema,
  AuthenticateUserSchema,
  updateUserSchema,
  setupStoreSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  UidsSchema,
  VerifySessionSchema,
} from "../schemas/user.schema";
import { prisma } from "../config/db.config";
import { OnboardingStep } from "../../prisma/generated";
import { buildNotification } from "../services/notification.services";
import { SubscriptionPlanFeatures } from "../schemas/subscriptionPlan.schema";
import { sendUserEmail } from "../emails";
import { CreateStore } from "../services/store";

function getMonthRange(date: Date) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
  };
}
type TimeRange = "Last 7 days" | "Last 30 days" | "Last 90 days";

export const userAnalytics = async (req: Request, res: Response) => {
  if (!req.auth?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { user } = req.auth;

  try {
    const now = new Date();

    const thisMonth = getMonthRange(now);
    const lastMonth = getMonthRange(
      new Date(now.getFullYear(), now.getMonth() - 1, 1)
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalStores,
      activeStores,
      storesThisMonth,
      storesLastMonth,
      activeThisMonth,
      activeLastMonth,
      subscription,
      stores,
      weeklyEvents,
    ] = await Promise.all([
      prisma.store.count({ where: { ownerId: user.id } }),
      prisma.store.count({
        where: { ownerId: user.id, status: "ACTIVE" },
      }),
      prisma.store.count({
        where: {
          ownerId: user.id,
          timestamp: { gte: thisMonth.start, lt: thisMonth.end },
        },
      }),
      prisma.store.count({
        where: {
          ownerId: user.id,
          timestamp: { gte: lastMonth.start, lt: lastMonth.end },
        },
      }),
      prisma.store.count({
        where: {
          ownerId: user.id,
          status: "ACTIVE",
          timestamp: { gte: thisMonth.start, lt: thisMonth.end },
        },
      }),
      prisma.store.count({
        where: {
          ownerId: user.id,
          status: "ACTIVE",
          timestamp: { gte: lastMonth.start, lt: lastMonth.end },
        },
      }),
      prisma.subscription.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        include: { plan: true },
      }),
      prisma.store.findMany({
        where: { ownerId: user.id },
        take: 5,
        orderBy: { timestamp: "desc" },
      }),
      prisma.platformEvent.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
      }),
    ]);

    // ---- Store changes
    const totalStoreChange = storesThisMonth - storesLastMonth;
    const activeStoreChange = activeThisMonth - activeLastMonth;

    // ---- Platform events aggregation for multiple ranges
    const timeRanges: TimeRange[] = [
      "Last 7 days",
      "Last 30 days",
      "Last 90 days",
    ];
    const platformEventsByRange: Record<
      TimeRange,
      { name: string; value: number }[]
    > = {
      "Last 7 days": [],
      "Last 30 days": [],
      "Last 90 days": [],
    };

    const getRangeStart = (range: TimeRange) => {
      const date = new Date();
      switch (range) {
        case "Last 7 days":
          date.setDate(date.getDate() - 6);
          break;
        case "Last 30 days":
          date.setDate(date.getDate() - 29);
          break;
        case "Last 90 days":
          date.setDate(date.getDate() - 89);
          break;
      }
      date.setHours(0, 0, 0, 0);
      return date;
    };

    timeRanges.forEach((range) => {
      const start = getRangeStart(range);
      const filteredEvents = weeklyEvents.filter(
        (e) => new Date(e.createdAt) >= start
      );

      const map = new Map<string, number>();
      const daysCount =
        range === "Last 7 days" ? 7 : range === "Last 30 days" ? 30 : 90;

      for (let i = 0; i < daysCount; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        map.set(label, 0);
      }

      filteredEvents.forEach((event) => {
        const d = new Date(event.createdAt);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        map.set(label, (map.get(label) || 0) + 1);
      });

      platformEventsByRange[range] = Array.from(map.entries()).map(
        ([name, value]) => ({
          name,
          value,
        })
      );
    });

    const features = subscription?.plan.features as SubscriptionPlanFeatures;
    const formattedFeatures = features
      ? [
          { name: "Stores", value: features.stores },
          { name: "Products", value: features.products ?? 0 },
          { name: "API Calls", value: features.api_access ? 1 : 0 },
          { name: "Staff Accounts", value: features.staff_accounts },
          { name: "Available Templates", value: features.available_templates },
        ]
      : [];

    return res.status(200).json({
      stores: {
        total: {
          value: totalStores,
          change:
            totalStoreChange === 0
              ? "No change this month"
              : totalStoreChange > 0
              ? `+${totalStoreChange} this month`
              : `${totalStoreChange} this month`,
        },
        active: {
          value: activeStores,
          change:
            activeStoreChange === 0
              ? "No change this month"
              : activeStoreChange > 0
              ? `+${activeStoreChange} this month`
              : `${activeStoreChange} this month`,
        },
      },
      subscription: {
        currentPlan: subscription?.plan.name ?? "Free",
        nextBillingDate: subscription?.expiresAt ?? null,
        features: formattedFeatures,
      },
      platformEvents: platformEventsByRange,
      allStores: stores,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        uid: true,
        image: true,
        email: true,
        fullName: true,
        status: true,
        _count: {
          select: {
            stores: true, // returns number of stores per user
          },
        },
      },
    });

    // Optionally map to a cleaner format
    const formattedUsers = users.map((user) => ({
      ...user,
      storesCount: user._count.stores,
    }));

    res.status(200).json(formattedUsers);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, fullName } = parsed.data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        uid: uuidv4(),
        fullName,
        password: hashedPassword,
        apiKey: uuidv4(),
      },
    });
    await prisma.platformEvent.create({
      data: {
        event: "USER_CREATED",
        category: "USER",
        entityUid: user.uid,
        userId: user.id,
      },
    });
    const token = jwt.sign(
      { email, apiKey: user.apiKey, uid: user.uid },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: pass, resetToken, resetTokenExpiry, ...safeUser } = user;

    res.status(201).json({
      success: "Successfully created user",
      user: safeUser,
      nextStep: "PLAN" as OnboardingStep,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const setupStore = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.user.id!;
    const parsed = setupStoreSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { type, name, domain, subscriptionId, logoUrl, color } = parsed.data;

    // Check if domain already exists
    const existingDomain = await prisma.store.findUnique({
      where: { uid: domain },
    });

    if (existingDomain) {
      return res.status(400).json({ error: "Domain already taken" });
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: {
        expiresAt: "desc", // get latest subscription
      },
    });

    if (!existingSubscription) {
      res.status(400).json({
        error:
          "Active subscription not found, If you paid manually kindly check back later when your subscription is active or contact support.",
      });
      return;
    }

    // Create store
    const { store, user } = await prisma.$transaction(
      async (tx) => {
        const store = await tx.store.create({
          data: {
            type,
            name,
            logoUrl,
            color,
            uid: domain,
            plan: existingSubscription.plan.name,
            ownerId: userId,
          },
        });

        const notificationDetails = buildNotification({
          category: "STORE",
          type: "STORE_CREATED",
          status: "success",
        });

        await tx.notification.create({
          data: {
            category: notificationDetails.category,
            title: notificationDetails.title,
            message: notificationDetails.message,
            userId: userId,
            meta: notificationDetails.meta,
          },
        });

        await tx.platformEvent.create({
          data: {
            event: "STORE_CREATED",
            category: "USER",
            entityUid: req.auth?.uid,
            userId: userId,
          },
        });

        const user = await tx.user.update({
          where: { id: userId },
          data: { onboardingStep: "COMPLETE" },
        });
        return { store, user };
      },
      {
        timeout: 10000,
      }
    );

    try {
      await CreateStore(user, store, existingSubscription);
    } catch (err) {
      console.error("Error creating store in internal API:", err);
      await prisma.store.delete({ where: { uid: store.uid } });
      await prisma.platformEvent.deleteMany({
        where: { entityUid: store.uid },
      });
      await prisma.notification.deleteMany({
        where: { userId: userId },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingStep: "PLAN" },
      });
      throw err;
    }

    const { password: _, resetToken, resetTokenExpiry, ...safeUser } = user;

    res.status(201).json({
      message: "Store setup successful",
      store,
      user: safeUser,
      onboardingStep: "COMPLETE" as OnboardingStep,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

export const me = async (req: Request, res: Response) => {
  const parsed = AuthenticateUserSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  try {
    const account = await prisma.user.findFirst({ where: { email } });

    if (!account)
      return res.status(400).json({ error: "Incorrect login details" });
    if (account.status === "BANNED")
      return res.status(403).json({ error: "Account is banned." });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect login details" });

    const token = jwt.sign(
      { email, apiKey: account.apiKey, uid: account.uid },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await prisma.platformEvent.create({
      data: {
        event: "USER_LOGIN",
        category: "USER",
        entityUid: account.uid,
        userId: account.id,
      },
    });

    const {
      password: pass,
      resetToken,
      resetTokenExpiry,
      ...safeUser
    } = account;
    res.status(200).json({
      success: "Logged in successfully",
      user: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserByUid = async (req: Request, res: Response) => {
  const { uid } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { uid },
      select: {
        id: true,
        uid: true,
        email: true,
        fullName: true,
        status: true,
      },
    });
    res.status(200).json({ user });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const verifySession = async (req: Request, res: Response) => {
  const parsed = VerifySessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { sessionCode } = parsed.data;

  const session = await prisma.sessionCode.findUnique({
    where: { code: sessionCode },
  });

  if (!session || session.used || new Date(session.expiresAt) < new Date()) {
    res.status(400).json({ error: "Invalid or expired session code" });
    return;
  }

  const account = await prisma.user.findFirst({
    where: { email: session.email },
  });

  if (!account) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await prisma.sessionCode.update({
    where: { code: sessionCode },
    data: { used: true },
  });

  const token = jwt.sign(
    { uid: account.uid, apiKey: account.apiKey, email: account.email },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, resetToken, resetTokenExpiry, ...safeUser } = account;

  res
    .status(200)
    .json({ success: "User authenticated successfully", user: safeUser });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { uid } = req.body;

  try {
    await prisma.user.delete({ where: { uid } });
    res.status(200).json({ success: "Successfully deleted user" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const deleteUsers = async (req: Request, res: Response) => {
  const input = UidsSchema.safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: input.error.flatten() });

  const uids = input.data.uids;

  try {
    await prisma.user.deleteMany({ where: { uid: { in: uids } } });
    res.status(200).json({ success: "Successfully deleted users" });
  } catch {
    res.status(500).json({ error: "Failed to delete users" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { uid } = req.auth!;
  const input = updateUserSchema.safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: input.error.flatten() });

  const { ...fields } = input.data;

  try {
    const user = await prisma.user.update({
      where: { uid },
      data: fields,
    });
    const { password, resetToken, resetTokenExpiry, ...safeUser } = user;
    res
      .status(200)
      .json({ success: "Successfully updated user", user: safeUser });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update user " + error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const input = forgotPasswordSchema.safeParse(req.body);
  if (!input.success) {
    return res.status(400).json({ error: input.error.flatten() });
  }

  const { email } = input.data;

  try {
    // Find user by email
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User with this email not found." });
    }

    // Generate reset token and expiry
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Save token to user record
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Send password reset email
    await sendUserEmail(user.email, "FORGOT_PASSWORD", {
      email: user.email,
      token: resetToken,
    });

    return res.status(200).json({
      success: "A password reset link has been sent to your email.",
    });
  } catch (err: any) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ error: "Failed to process password reset." });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const input = resetPasswordSchema.safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: input.error.flatten() });

  const { password, token, email } = input.data;

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    if (!user.resetToken || user.resetToken !== token) {
      return res.status(400).json({ error: "Invalid reset token." });
    }

    if (
      !user.resetTokenExpiry ||
      new Date(user.resetTokenExpiry) < new Date()
    ) {
      return res.status(400).json({ error: "Token expired." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Send password changed email
    await sendUserEmail(user.email, "PASSWORD_CHANGED");
    res.status(200).json({ success: "Password updated successfully." });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to update password: " + err.message });
  }
};

export const banUsers = async (req: Request, res: Response) => {
  const input = UidsSchema.safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: input.error.flatten() });

  const uids = input.data.uids;

  try {
    await prisma.user.updateMany({
      where: { uid: { in: uids } },
      data: { status: "BANNED" },
    });
    res.status(200).json({ success: "Banned users successfully" });
  } catch {
    res.status(500).json({ error: "Failed to ban users" });
  }
};

export const activateMultipleUsers = async (req: Request, res: Response) => {
  const input = UidsSchema.safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: input.error.flatten() });

  const uids = input.data.uids;

  try {
    await prisma.user.updateMany({
      where: { uid: { in: uids } },
      data: { status: "ACTIVE" },
    });
    res.status(200).json({ success: "Activated users successfully" });
  } catch {
    res.status(500).json({ error: "Failed to activate users" });
  }
};
