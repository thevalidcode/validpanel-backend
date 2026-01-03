import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AuthSchema } from "../schemas/user.schema";
import {
  SubscriptionUidSchema,
  SubscriptionUpdateRequestSchema,
  UpgradePlanSchema,
  DowngradePlanSchema,
  SubscriptionPaymentSchema,
  RenewSubscriptionPaymentSchema,
} from "../schemas/subscription.schema";
import * as paymentServices from "../services/subscription/payment.services";

export const getSubscriptions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { id: "desc" },
      include: { plan: true },
    });

    res.status(200).json(subscriptions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getActiveSubscriptionForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { id: "desc" },
      include: { plan: true },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = SubscriptionUidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { uid },
      include: { plan: true },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { user } = authParsed.data;

  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVE", userId: user.id },
      orderBy: { id: "desc" },
      include: { plan: true },
    });

    res.status(200).json(subscriptions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionByUidForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = SubscriptionUidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }
  const { uid } = paramsParsed.data;
  const { user } = authParsed.data;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { uid, status: "ACTIVE", userId: user.id },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const upgradePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = UpgradePlanSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { planId } = parsed.data;
  const { user } = authParsed.data;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, status: "ACTIVE" },
    });

    if (!plan) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      res
        .status(404)
        .json({ error: "You don't have any active subscription." });
      return;
    }

    const result = await paymentServices.upgradePlan(user, {
      ...parsed.data,
      subscriptionId: subscription.id,
    });

    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const downgradePlan = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate auth and request body
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = DowngradePlanSchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { user } = authParsed.data;
  const { planId } = parsed.data;

  try {
    // Check target plan exists and is active
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, status: "ACTIVE" },
    });

    if (!plan) {
      res.status(404).json({ error: "Target subscription plan not found." });
      return;
    }

    // Fetch user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      res
        .status(404)
        .json({ error: "You don't have any active subscription." });
      return;
    }

    // Schedule the downgrade by updating pendingPlanId
    if (subscription.planId === plan.id) {
      res.status(400).json({ error: "You are already on this plan." });
      return;
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        pendingPlanId: plan.id, // only update what is necessary
      },
    });

    await prisma.platformEvent.create({
      data: {
        event: "SUBSCRIPTION_DOWNGRADE",
        category: "SUBSCRIPTION",
        entityUid: subscription.uid,
        userId: user.id,
      },
    });

    res.status(200).json({
      success:
        "Downgrade scheduled successfully. It will apply after the current plan expires.",
    });
  } catch (err: any) {
    console.error("Error scheduling downgrade:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const createSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = SubscriptionPaymentSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { planId, billingCycle } = parsed.data;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, status: "ACTIVE" },
    });

    if (!plan) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    // Check for existing active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "ACTIVE",
      },
    });

    if (activeSubscription) {
      res.status(200).json({
        success: "You already have an active subscription.",
        url: `${parsed.data.redirectUrl}?subscriptionId=${activeSubscription.id}`,
      });
      return;
    }

    // Check for existing pending subscription
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    });

    if (subscription) {
      // Update existing pending subscription
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          planId,
          billingCycle,
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId,
          billingCycle,
          status: "PENDING",
        },
      });
    }

    const result = await paymentServices.createSubscriptionPayment(
      user,
      "SUBSCRIPTION_PAYMENT",
      {
        ...parsed.data,
        redirectUrl: `${parsed.data.redirectUrl}?subscriptionId=${subscription.id}`,
        subscriptionId: subscription.id,
      }
    );
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const renewSubscription = async (req: Request, res: Response) => {
  const parsed = RenewSubscriptionPaymentSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { planId } = parsed.data;

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId, status: "ACTIVE" },
    });

    if (!plan) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      res
        .status(404)
        .json({ error: "You don't have any active subscription to renew." });
      return;
    }

    const RENEWAL_WINDOW_DAYS = 7; // allow renewal up to 7 days before expiry

    if (!subscription.expiresAt) {
      return res.status(400).json({ error: "Invalid subscription." });
    }

    const now = new Date();
    const renewalWindowStart = new Date(subscription.expiresAt);
    renewalWindowStart.setDate(
      renewalWindowStart.getDate() - RENEWAL_WINDOW_DAYS
    );

    if (now < renewalWindowStart) {
      return res.status(400).json({
        error: `You can renew your subscription only within ${RENEWAL_WINDOW_DAYS} days of expiry.`,
      });
    }

    const result = await paymentServices.createSubscriptionPayment(
      user,
      "SUBSCRIPTION_RENEWAL",
      {
        ...parsed.data,
        subscriptionId: subscription.id,
        billingCycle: subscription.billingCycle,
      }
    );
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const updateSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = SubscriptionUpdateRequestSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid, status } = parsed.data;

  try {
    await prisma.subscription.update({
      where: { uid },
      data: {
        status,
      },
    });

    res.status(200).json({
      success: "Subscription updated successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
