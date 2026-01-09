import {
  Payment,
  Subscription,
  SubscriptionPlan,
} from "../../../prisma/generated";
import { Decimal } from "../../../prisma/generated/runtime/client";
import { prisma } from "../../config/db.config";
import { buildNotification } from "../../services/notification.services";

const BATCH_SIZE = 20;
const CONCURRENCY = 5;

/**
 * Cron job entry point
 */
export const processDueRenewals = async () => {
  const now = new Date();
  let offset = 0;

  while (true) {
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { lte: now },
      },
      include: {
        plan: true,
        pendingPlan: true,
      },
      take: BATCH_SIZE,
      skip: offset,
      orderBy: { id: "asc" },
    });

    if (dueSubscriptions.length === 0) break;

    for (let i = 0; i < dueSubscriptions.length; i += CONCURRENCY) {
      const chunk = dueSubscriptions.slice(i, i + CONCURRENCY);
      for (const subscription of chunk) {
        await handleRenewal(subscription);
      }
    }

    offset += BATCH_SIZE;
  }

  console.log("Due renewals processed.");
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

  const locked = await prisma.subscription.updateMany({
    where: { id: subscription.id, status: "ACTIVE", renewalProcessingAt: null },
    data: { renewalProcessingAt: now },
  });
  if (locked.count === 0) return;

  try {
    const finalPlan = subscription.pendingPlan ?? subscription.plan;
    const finalPlanId = finalPlan.id;
    const wasDowngrade = Boolean(subscription.pendingPlanId);

    let inGracePeriod = false;
    if (subscription.plan.gracePeriod) {
      const graceExpiry = new Date(subscription.expiresAt!);
      graceExpiry.setDate(
        graceExpiry.getDate() + subscription.plan.gracePeriod
      );
      inGracePeriod = now <= graceExpiry;
    }

    const price = new Decimal(finalPlan.price);

    if (price.gt(0)) {
      if (!inGracePeriod) {
        await expireSubscription(subscription);
        return;
      }

      await createRenewalPaymentsBulk([subscription], finalPlan, wasDowngrade);
      return;
    }

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

    await notifySuccessBulk(
      [subscription],
      finalPlan,
      nextExpiry,
      wasDowngrade ? "SUBSCRIPTION_DOWNGRADE" : "SUBSCRIPTION_RENEWAL"
    );
  } finally {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { renewalProcessingAt: null },
    });
  }
};

/**
 * Expire subscription
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
 * Bulk renewal payments
 */
const createRenewalPaymentsBulk = async (
  subscriptions: (Subscription & {
    plan: SubscriptionPlan;
    pendingPlan: SubscriptionPlan | null;
  })[],
  plan: SubscriptionPlan,
  wasDowngrade: boolean
) => {
  const paymentsData: any[] = [];
  const transactionsData: any[] = [];

  for (const sub of subscriptions) {
    const user = await prisma.user.findUnique({ where: { id: sub.userId } });
    if (!user) continue;

    const amount = new Decimal(plan.price);
    if (amount.lte(0)) continue;

    const existing = await prisma.payment.findFirst({
      where: { subscriptionId: sub.id, status: "PENDING" },
    });
    if (existing) continue;

    paymentsData.push({
      status: "PENDING",
      subscriptionId: sub.id,
      planId: plan.id,
      amount,
      chargedAmount: amount,
      currency: plan.currency,
      method: "CRON",
      userId: sub.userId,
    });

    transactionsData.push({
      status: "PENDING",
      subscriptionId: sub.id,
      amount,
      currency: plan.currency,
      type: wasDowngrade ? "SUBSCRIPTION_DOWNGRADE" : "SUBSCRIPTION_RENEWAL",
      userUid: user.uid,
    });
  }

  if (paymentsData.length === 0) return;

  await prisma.$transaction(async (tx) => {
    await tx.payment.createMany({ data: paymentsData });
    // Link transactions to payments if needed
    await tx.transaction.createMany({ data: transactionsData });
  });
};

/**
 * Bulk notifications
 */
const notifySuccessBulk = async (
  subscriptions: (Subscription & {
    plan: SubscriptionPlan;
    pendingPlan: SubscriptionPlan | null;
  })[],
  plan: SubscriptionPlan,
  expiresAt: Date,
  type: "SUBSCRIPTION_RENEWAL" | "SUBSCRIPTION_DOWNGRADE"
) => {
  const notificationsData = subscriptions.map((sub) => {
    const n = buildNotification({
      category: "PAYMENT",
      type,
      planName: plan.name,
      status: "success",
      expiresAt,
      meta: { planId: plan.id },
    });
    return {
      category: n.category,
      title: n.title,
      message: n.message,
      userId: sub.userId,
      meta: n.meta,
    };
  });

  if (notificationsData.length === 0) return;

  await prisma.notification.createMany({ data: notificationsData });
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
