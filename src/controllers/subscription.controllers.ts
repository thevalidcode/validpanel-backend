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
import { AdminAuthSchema } from "../schemas/admin.schema";
import { finalizeSubscriptionPayment } from "../services/subscription/finalize-subscription-payment";
import { sendUserEmail } from "../emails";
import { env } from "../config/env.config";
import { resolvePriceForSubscription } from "../services/subscription/pricing-resolution";
import { Decimal } from "@prisma/client/runtime/client";

export const getActiveSubscriptionForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { status: "ACTIVE", userId: authParsed.data.user.id },
      include: {
        plan: {
          include: {
            prices: { where: { isActive: true } },
          },
        },
      },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentSubscriptionsForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { user } = authParsed.data;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: {
        plan: {
          include: {
            prices: { where: { isActive: true } },
          },
        },
      },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionByUidForUser = async (
  req: Request,
  res: Response,
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
  res: Response,
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

    let subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      res
        .status(404)
        .json({ error: "You don't have any active subscription." });
      return;
    }

    // Find pending subscription
    let pendingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    });

    if (pendingSubscription) {
      // Update existing pending pendingSubscription
      pendingSubscription = await prisma.subscription.update({
        where: { id: pendingSubscription.id },
        data: {
          planId,
          billingCycle: parsed.data.billingCycle,
          startedAt: subscription.startedAt,
          expiresAt: subscription.expiresAt,
        },
      });
    } else {
      // Create new pending subscription
      pendingSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId,
          billingCycle: parsed.data.billingCycle,
          status: "PENDING",
          startedAt: subscription.startedAt,
          expiresAt: subscription.expiresAt,
        },
      });
    }

    const result = await paymentServices.upgradePlan(user, {
      ...parsed.data,
      subscriptionId: pendingSubscription.id,
    });

    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const downgradePlan = async (
  req: Request,
  res: Response,
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

    const currentPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscription.planId },
    });

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

    // Send downgrade scheduled email in production
    if (env.NODE_ENV === "production") {
      await sendUserEmail(user.email, "SUBSCRIPTION_DOWNGRADE_SCHEDULED", {
        firstName: user.fullName?.split(" ")[0] || "User",
        currentPlanName: currentPlan?.name || "Current Plan",
        newPlanName: plan.name,
        effectiveDate:
          subscription.expiresAt?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) || "End of current billing cycle",
      });
    }

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
  res: Response,
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

    await resolvePriceForSubscription({
      planId,
      interval: billingCycle,
      currency: parsed.data.currency,
    });

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
      },
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

    await resolvePriceForSubscription({
      planId,
      interval: parsed.data.billingCycle,
      currency: parsed.data.currency,
    });

    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
    });

    if (!subscription) {
      res
        .status(404)
        .json({ error: "You don't have any active subscription to renew." });
      return;
    }

    if (!subscription.expiresAt) {
      return res.status(400).json({ error: "Invalid subscription." });
    }

    // Find pending subscription
    let pendingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    });

    if (pendingSubscription) {
      // Update existing pending pendingSubscription
      pendingSubscription = await prisma.subscription.update({
        where: { id: pendingSubscription.id },
        data: {
          planId,
          billingCycle: subscription.billingCycle,
          startedAt: subscription.startedAt,
          expiresAt: subscription.expiresAt,
        },
      });
    } else {
      // Create new pending subscription
      pendingSubscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId,
          billingCycle: subscription.billingCycle,
          status: "PENDING",
          startedAt: subscription.startedAt,
          expiresAt: subscription.expiresAt,
        },
      });
    }

    const RENEWAL_WINDOW_DAYS = 7; // allow renewal up to 7 days before expiry

    const now = new Date();
    const renewalWindowStart = new Date(subscription.expiresAt);
    renewalWindowStart.setDate(
      renewalWindowStart.getDate() - RENEWAL_WINDOW_DAYS,
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
        subscriptionId: pendingSubscription.id,
        billingCycle: pendingSubscription.billingCycle,
      },
    );
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const updateSubscription = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
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
    await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { uid },
        include: {
          user: true,
          plan: true,
        },
      });

      if (!subscription) {
        throw new Error("SUBSCRIPTION_NOT_FOUND");
      }

      // Idempotency
      if (subscription.status === status) {
        return;
      }

      if (subscription.status === "EXPIRED") {
        throw new Error("You cannot update an expired subscription.");
      }

      // Cancellation path
      if (status === "CANCELED") {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: { status: "CANCELED" },
        });

        // Send cancellation email in production
        if (env.NODE_ENV === "production") {
          await sendUserEmail(
            subscription.user.email,
            "SUBSCRIPTION_CANCELLED",
            {
              firstName: subscription.user.fullName?.split(" ")[0] || "User",
              planName: subscription.plan.name,
              cancelledAt: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            },
          );
        }
        return;
      }

      if (status !== "ACTIVE") {
        throw new Error("UNSUPPORTED_STATUS_TRANSITION");
      }

      // Fetch latest payment regardless of state
      const payment = await tx.payment.findFirst({
        where: { subscriptionId: subscription.id },
        orderBy: { createdAt: "desc" },
      });

      if (!payment) {
        throw new Error("PAYMENT_NOT_FOUND");
      }

      const transaction = await tx.transaction.findFirst({
        where: { paymentId: payment.id },
        orderBy: { timestamp: "desc" },
      });

      if (!transaction) {
        throw new Error("TRANSACTION_NOT_FOUND");
      }

      const isAlreadyPaid =
        payment.status === "SUCCESS" && transaction.status === "SUCCESS";

      const isManualOverride =
        payment.status === "PENDING" && transaction.status === "PENDING";

      if (!isAlreadyPaid && !isManualOverride) {
        throw new Error("INVALID_PAYMENT_STATE");
      }

      // Only finalize when manually confirming payment
      if (isManualOverride) {
        const selectedPrice = await resolvePriceForSubscription({
          planId: subscription.planId,
          interval: subscription.billingCycle,
          currency: payment.currency,
        });
        await finalizeSubscriptionPayment(
          {
            subscriptionId: subscription.id,
            userId: subscription.user.id,
            transactionId: transaction.id,
            paymentId: payment.id,
            type: transaction.type,
            amount: new Decimal(selectedPrice.price),
            billingCycle: subscription.billingCycle,
            newPlanId: subscription.planId,
          },
          tx,
        );
      }

      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE" },
      });
    });

    res.status(200).json({
      success: "Subscription updated successfully.",
    });
    return;
  } catch (error: any) {
    console.log(error);
    const message = error.message;

    if (message === "SUBSCRIPTION_NOT_FOUND") {
      res.status(404).json({ error: "Subscription not found." });
      return;
    }

    if (
      message === "PAYMENT_NOT_FOUND" ||
      message === "TRANSACTION_NOT_FOUND" ||
      message === "INVALID_PAYMENT_STATE" ||
      message === "UNSUPPORTED_STATUS_TRANSITION"
    ) {
      res.status(409).json({ error: message });
      return;
    }
    res.status(500).json({ error: "Internal server error. " + error.messasge });
    return;
  }
};

export const getSubscriptions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { id: "desc" },
      include: {
        plan: true,
        user: {
          select: {
            email: true,
            fullName: true,
            id: true,
            uid: true,
            image: true,
          },
        },
      },
    });

    res.status(200).json(subscriptions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
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
      include: {
        plan: true,
        user: {
          select: {
            email: true,
            fullName: true,
            id: true,
            uid: true,
            image: true,
          },
        },
      },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
