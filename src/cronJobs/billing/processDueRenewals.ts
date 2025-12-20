import { Subscription, SubscriptionPlan } from "../../../prisma/generated";
import { Decimal } from "../../../prisma/generated/runtime/library";
import { prisma } from "../../config/db.config";
import { buildNotification } from "../../services/notification.services";

/**
 * Runs as a cron job to process all subscriptions that have reached expiry.
 * Handles renewals, scheduled downgrades, and grace periods.
 */
export const processDueRenewals = async () => {
  const now = new Date();

  // Fetch all active subscriptions that have expired or are in grace period
  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        lte: now,
      },
    },
    include: { plan: true },
  });

  for (const sub of dueSubscriptions) {
    try {
      await handleRenewal(sub);
    } catch (err) {
      console.error(`Failed to process subscription ${sub.id}:`, err);
    }
  }
};

/**
 * Handles a single subscription renewal
 */
const handleRenewal = async (
  subscription: Subscription & { plan: SubscriptionPlan }
) => {
  const now = new Date();

  // Calculate grace period expiry
  let inGracePeriod = false;
  if (subscription.plan.gracePeriod) {
    const graceExpiry = new Date(subscription.expiresAt!);
    graceExpiry.setDate(graceExpiry.getDate() + subscription.plan.gracePeriod);
    inGracePeriod = now <= graceExpiry;
  }

  // 1. Apply scheduled downgrade if any
  const finalPlanId = subscription.pendingPlanId ?? subscription.planId;

  // 2. Determine if payment is required
  const planPrice = new Decimal(subscription.plan.price);
  if (planPrice.gt(0)) {
    // If within grace period, we might still attempt renewal
    if (!inGracePeriod) {
      // mark subscription as expired
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });

      const notificationDetails = buildNotification({
        category: "SUBSCRIPTION",
        type: "SUBSCRIPTION_EXPIRED",
        planName: subscription.plan.name,
        status: "success",
        expiresAt: subscription.expiresAt,
        meta: {
          planId: subscription.planId,
        },
      });

      await prisma.notification.create({
        data: {
          category: notificationDetails.category,
          title: notificationDetails.title,
          message: notificationDetails.message,
          userId: subscription.userId,
          meta: notificationDetails.meta,
        },
      });
      return;
    }

    // initiate renewal payment
    await createRenewalPayment(subscription, finalPlanId);
    return;
  }

  // 3. Free plan or zero-cost renewal
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      planId: finalPlanId,
      pendingPlanId: null,
      startedAt: new Date(),
      expiresAt: calculateNextExpiry(subscription.plan.interval),
    },
  });

  const notificationDetails = buildNotification({
    category: "PAYMENT",
    type: subscription.pendingPlanId
      ? "SUBSCRIPTION_DOWNGRADE"
      : "SUBSCRIPTION_RENEWAL",
    planName: subscription.plan.name,
    status: "success",
    expiresAt: subscription.expiresAt,
    meta: {
      planId: subscription.planId,
    },
  });

  await prisma.notification.create({
    data: {
      category: notificationDetails.category,
      title: notificationDetails.title,
      message: notificationDetails.message,
      userId: subscription.userId,
      meta: notificationDetails.meta,
    },
  });
};

/**
 * Calculate the next expiry date based on plan interval
 */
const calculateNextExpiry = (interval: "MONTHLY" | "YEARLY") => {
  const now = new Date();
  if (interval === "MONTHLY") {
    return new Date(now.setMonth(now.getMonth() + 1));
  } else if (interval === "YEARLY") {
    return new Date(now.setFullYear(now.getFullYear() + 1));
  }
  return now;
};

const createRenewalPayment = async (
  subscription: Subscription,
  planId: number
) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });
  const user = await prisma.user.findUnique({
    where: { id: subscription.userId },
  });

  if (!plan) throw new Error("Plan not found");
  if (!user) throw new Error("User not found");

  const amount = new Decimal(plan.price);
  if (amount.lte(0)) return;

  // Avoid duplicate pending payments
  const existingPayment = await prisma.payment.findFirst({
    where: {
      userId: subscription.userId,
      planId,
      status: "PENDING",
    },
  });
  if (existingPayment) return;

  // Create payment and transaction atomically
  await prisma.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        status: "PENDING",
        planId: plan.id,
        amount,
        chargedAmount: amount,
        method: "CRON",
        currency: "USD",
        userId: subscription.userId,
      },
    });

    await tx.transaction.create({
      data: {
        status: "PENDING",
        amount,
        type: subscription.pendingPlanId
          ? "SUBSCRIPTION_DOWNGRADE"
          : "SUBSCRIPTION_RENEWAL",
        currency: "USD",
        userUid: user.uid,
      },
    });
  });
};
