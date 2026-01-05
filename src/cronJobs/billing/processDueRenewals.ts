import { Subscription, SubscriptionPlan } from "../../../prisma/generated";
import { Decimal } from "../../../prisma/generated/runtime/library";
import { prisma } from "../../config/db.config";
import { buildNotification } from "../../services/notification.services";

/**
 * Cron job entry point
 */
export const processDueRenewals = async () => {
  const now = new Date();

  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lte: now },
    },
    include: {
      plan: true,
      pendingPlan: true,
    },
  });

  for (const sub of dueSubscriptions) {
    try {
      await handleRenewal(sub);
    } catch (err) {
      console.error(`[CRON][RENEWAL_FAILED] subscription=${sub.id}`, err);
    }
  }
};

/**
 * Handles a single subscription renewal safely
 */
const handleRenewal = async (
  subscription: Subscription & {
    plan: SubscriptionPlan;
    pendingPlan: SubscriptionPlan | null;
  }
) => {
  const now = new Date();

  // Prevent concurrent cron execution on same row
  const locked = await prisma.subscription.updateMany({
    where: {
      id: subscription.id,
      status: "ACTIVE",
      renewalProcessingAt: null,
    },
    data: {
      renewalProcessingAt: now,
    },
  });

  if (locked.count === 0) return;

  try {
    const finalPlan = subscription.pendingPlan ?? subscription.plan;
    const finalPlanId = finalPlan.id;
    const wasDowngrade = Boolean(subscription.pendingPlanId);

    // ---- Grace Period ----
    let inGracePeriod = false;
    if (subscription.plan.gracePeriod) {
      const graceExpiry = new Date(subscription.expiresAt!);
      graceExpiry.setDate(
        graceExpiry.getDate() + subscription.plan.gracePeriod
      );
      inGracePeriod = now <= graceExpiry;
    }

    const price = new Decimal(finalPlan.price);

    // ---- Paid Plan ----
    if (price.gt(0)) {
      if (!inGracePeriod) {
        await expireSubscription(subscription);
        return;
      }

      await createRenewalPayment(subscription, finalPlan, wasDowngrade);
      return;
    }

    // ---- Free Plan ----
    const nextExpiry = calculateNextExpiry(
      subscription.expiresAt ?? now,
      finalPlan.interval
    );

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: finalPlanId,
        pendingPlanId: null,
        expiresAt: nextExpiry,
        renewedAt: now,
      },
    });

    await notifySuccess(
      subscription,
      finalPlan,
      nextExpiry,
      wasDowngrade ? "SUBSCRIPTION_DOWNGRADE" : "SUBSCRIPTION_RENEWAL"
    );
  } finally {
    // Always release lock
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { renewalProcessingAt: null },
    });
  }
};

/**
 * Marks subscription as expired
 */
const expireSubscription = async (subscription: Subscription) => {
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "EXPIRED" },
  });

  const notification = buildNotification({
    category: "SUBSCRIPTION",
    type: "SUBSCRIPTION_EXPIRED",
    planName: subscription.planId.toString(),
    status: "warning",
    expiresAt: subscription.expiresAt,
    meta: { planId: subscription.planId },
  });

  await prisma.notification.create({
    data: {
      category: notification.category,
      title: notification.title,
      message: notification.message,
      userId: subscription.userId,
      meta: notification.meta,
    },
  });
};

/**
 * Creates renewal payment safely
 */
const createRenewalPayment = async (
  subscription: Subscription,
  plan: SubscriptionPlan,
  wasDowngrade: boolean
) => {
  const user = await prisma.user.findUnique({
    where: { id: subscription.userId },
  });
  if (!user) throw new Error("User not found");

  const amount = new Decimal(plan.price);
  if (amount.lte(0)) return;

  const existing = await prisma.payment.findFirst({
    where: {
      subscriptionId: subscription.id,
      status: "PENDING",
    },
  });
  if (existing) return;

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        status: "PENDING",
        subscriptionId: subscription.id,
        planId: plan.id,
        amount,
        chargedAmount: amount,
        currency: plan.currency,
        method: "CRON",
        userId: subscription.userId,
      },
    });

    await tx.transaction.create({
      data: {
        status: "PENDING",
        paymentId: payment.id,
        amount,
        currency: plan.currency,
        type: wasDowngrade ? "SUBSCRIPTION_DOWNGRADE" : "SUBSCRIPTION_RENEWAL",
        userUid: user.uid,
      },
    });
  });
};

/**
 * Sends success notification
 */
const notifySuccess = async (
  subscription: Subscription,
  plan: SubscriptionPlan,
  expiresAt: Date,
  type: "SUBSCRIPTION_RENEWAL" | "SUBSCRIPTION_DOWNGRADE"
) => {
  const notification = buildNotification({
    category: "PAYMENT",
    type,
    planName: plan.name,
    status: "success",
    expiresAt,
    meta: { planId: plan.id },
  });

  await prisma.notification.create({
    data: {
      category: notification.category,
      title: notification.title,
      message: notification.message,
      userId: subscription.userId,
      meta: notification.meta,
    },
  });
};

/**
 * Date utility
 */
const calculateNextExpiry = (base: Date, interval: "MONTHLY" | "YEARLY") => {
  const d = new Date(base);
  if (interval === "MONTHLY") d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d;
};
