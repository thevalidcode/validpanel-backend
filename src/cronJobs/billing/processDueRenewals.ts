import { Subscription, PlanPrice } from "../../../prisma/generated";
import { Decimal } from "../../../prisma/generated/runtime/client";
import { prisma } from "../../config/db.config";
import { buildNotification } from "../../services/notification.services";
import { sendUserEmail } from "../../emails";
import { env } from "../../config/env.config";
import { computePricingBreakdown } from "../../core/pricing/pricing-core";

const EXPIRING_SOON_DAYS = 7; // Send first warning 7 days before
const EXPIRING_TOMORROW_DAYS = 1; // Send urgent warning 1 day before

const BATCH_SIZE = 20;
const CONCURRENCY = 5;

type RenewalPlanShape = {
  id: number;
  name: string;
  gracePeriod: number | null;
  prices: PlanPrice[];
};

const pickPriceForCycle = (
  prices: PlanPrice[],
  billingCycle: "MONTHLY" | "YEARLY",
  preferredCurrency?: string,
) => {
  const active = prices.filter((p) => p.isActive);
  const byCycle = active.filter((p) => p.interval === billingCycle);
  const byCurrency = preferredCurrency
    ? byCycle.find((p) => p.currency === preferredCurrency)
    : undefined;

  return (
    byCurrency ??
    byCycle.find((p) => p.isDefault) ??
    byCycle[0] ??
    active.find((p) => p.isDefault) ??
    active[0]
  );
};

/**
 * Cron job entry point - processes subscriptions that have already expired
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
        plan: { include: { prices: true } },
        pendingPlan: { include: { prices: true } },
        user: true,
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
};

/**
 * Sends warning emails for subscriptions expiring soon
 */
export const processExpiringWarnings = async () => {
  const now = new Date();

  // Get subscriptions expiring in 7 days
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + EXPIRING_SOON_DAYS);
  const sevenDaysStart = new Date(sevenDaysFromNow);
  sevenDaysStart.setHours(0, 0, 0, 0);
  const sevenDaysEnd = new Date(sevenDaysFromNow);
  sevenDaysEnd.setHours(23, 59, 59, 999);

  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        gte: sevenDaysStart,
        lte: sevenDaysEnd,
      },
    },
    include: {
      plan: { include: { prices: true } },
      user: true,
    },
  });

  for (const subscription of expiringSoon) {
    await sendExpiringWarning(subscription);
  }

  // Get subscriptions expiring tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + EXPIRING_TOMORROW_DAYS);
  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const expiringTomorrow = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
    include: {
      plan: { include: { prices: true } },
      user: true,
    },
  });

  for (const subscription of expiringTomorrow) {
    await sendExpiringTomorrowWarning(subscription);
  }
};

/**
 * Sends grace period notifications
 */
export const processGracePeriodNotifications = async () => {
  const now = new Date();

  // Find subscriptions that expired today and have grace period
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const expiredToday = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        gte: todayStart,
        lte: todayEnd,
      },
      plan: {
        gracePeriod: {
          gt: 0,
        },
      },
    },
    include: {
      plan: { include: { prices: true } },
      user: true,
    },
  });

  for (const subscription of expiredToday) {
    await sendGracePeriodNotification(subscription);
  }

  // Find subscriptions where grace period expired today
  const subscriptionsInGrace = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: {
        lt: now,
      },
      plan: {
        gracePeriod: {
          gt: 0,
        },
      },
    },
    include: {
      plan: { include: { prices: true } },
      user: true,
    },
  });

  for (const subscription of subscriptionsInGrace) {
    if (!subscription.expiresAt || !subscription.plan.gracePeriod) continue;

    const graceExpiry = new Date(subscription.expiresAt);
    graceExpiry.setDate(graceExpiry.getDate() + subscription.plan.gracePeriod);

    // Check if grace period expires today
    const graceExpiryStart = new Date(graceExpiry);
    graceExpiryStart.setHours(0, 0, 0, 0);
    const graceExpiryEnd = new Date(graceExpiry);
    graceExpiryEnd.setHours(23, 59, 59, 999);

    if (now >= graceExpiryStart && now <= graceExpiryEnd) {
      await sendGracePeriodExpiredNotification(subscription);
    }
  }
};

/**
 * Handles a single subscription renewal safely
 */
const handleRenewal = async (
  subscription: Subscription & {
    plan: RenewalPlanShape;
    pendingPlan: (RenewalPlanShape & Record<string, any>) | null;
    user: any;
  },
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
        graceExpiry.getDate() + subscription.plan.gracePeriod,
      );
      inGracePeriod = now <= graceExpiry;
    }

    const selectedPrice = pickPriceForCycle(
      finalPlan.prices,
      subscription.billingCycle,
      subscription.user?.currency,
    );
    const price = new Decimal(selectedPrice?.price ?? 0);

    if (price.gt(0)) {
      if (!inGracePeriod) {
        await expireSubscription(subscription);
        return;
      }

      // In grace period - send notification if entering grace period today
      if (subscription.expiresAt) {
        const expiredDate = new Date(subscription.expiresAt);
        const now = new Date();
        const daysSinceExpired = Math.floor(
          (now.getTime() - expiredDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Send grace period notification on first day
        if (daysSinceExpired === 0) {
          await sendGracePeriodNotification(subscription);
        }
      }

      await createRenewalPaymentsBulk([subscription], finalPlan, wasDowngrade);
      return;
    }

    const nextExpiry = calculateNextExpiry(
      subscription.expiresAt ?? now,
      subscription.billingCycle,
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
      wasDowngrade ? "SUBSCRIPTION_DOWNGRADE" : "SUBSCRIPTION_RENEWAL",
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
  const user = await prisma.user.findUnique({
    where: { id: subscription.userId },
  });

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: subscription.planId },
  });

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "EXPIRED" },
  });

  const notification = buildNotification({
    category: "SUBSCRIPTION",
    type: "SUBSCRIPTION_EXPIRED",
    planName: plan?.name || subscription.planId.toString(),
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

  // Send expiration email in production
  if (env.NODE_ENV === "production" && user) {
    await sendUserEmail(user.email, "SUBSCRIPTION_EXPIRED", {
      firstName: user.fullName?.split(" ")[0] || "User",
      planName: plan?.name || "Your Plan",
      expiredAt:
        subscription.expiresAt?.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    });
  }
};

/**
 * Bulk renewal payments
 */
const createRenewalPaymentsBulk = async (
  subscriptions: (Subscription & {
    plan: RenewalPlanShape;
    pendingPlan: (RenewalPlanShape & Record<string, any>) | null;
  })[],
  plan: RenewalPlanShape,
  wasDowngrade: boolean,
) => {
  const paymentsData: any[] = [];
  const transactionsData: any[] = [];

  for (const sub of subscriptions) {
    const user = await prisma.user.findUnique({ where: { id: sub.userId } });
    if (!user) continue;

    const selectedPrice = pickPriceForCycle(
      plan.prices,
      sub.billingCycle,
      user.currency,
    );
    const amount = new Decimal(selectedPrice?.price ?? 0);
    if (amount.lte(0)) continue;

    const currency = (selectedPrice?.currency ?? user.currency).toUpperCase();
    const breakdown = computePricingBreakdown({
      subtotal: amount,
      taxRate: selectedPrice?.tax ?? 0,
      couponApplied: false,
      subtotalCurrency: currency,
    });

    const existing = await prisma.payment.findFirst({
      where: { subscriptionId: sub.id, status: "PENDING" },
    });
    if (existing) continue;

    paymentsData.push({
      status: "PENDING",
      subscriptionId: sub.id,
      planId: plan.id,
      amount,
      chargedAmount: new Decimal(breakdown.total),
      discountAmount: new Decimal(0),
      taxAmount: new Decimal(breakdown.taxAmount),
      finalAmount: new Decimal(breakdown.total),
      currency,
      method: "CRON",
      userId: sub.userId,
    });

    transactionsData.push({
      status: "PENDING",
      subscriptionId: sub.id,
      amount: new Decimal(breakdown.total),
      currency,
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
    plan: RenewalPlanShape;
    pendingPlan: RenewalPlanShape | null;
  })[],
  plan: RenewalPlanShape,
  expiresAt: Date,
  type: "SUBSCRIPTION_RENEWAL" | "SUBSCRIPTION_DOWNGRADE",
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

/**
 * Send expiring soon warning email (7 days before)
 */
const sendExpiringWarning = async (
  subscription: Subscription & { plan: RenewalPlanShape; user: any },
) => {
  if (!subscription.user || !subscription.expiresAt) return;

  if (env.NODE_ENV === "production") {
    await sendUserEmail(subscription.user.email, "SUBSCRIPTION_EXPIRING_SOON", {
      firstName: subscription.user.fullName?.split(" ")[0] || "User",
      planName: subscription.plan.name,
      expiresAt: subscription.expiresAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      daysRemaining: EXPIRING_SOON_DAYS,
    });
  }

  // Create notification
  const notification = buildNotification({
    category: "SUBSCRIPTION",
    type: "SUBSCRIPTION_EXPIRED",
    planName: subscription.plan.name,
    status: "warning",
    expiresAt: subscription.expiresAt,
    meta: { planId: subscription.planId, daysRemaining: EXPIRING_SOON_DAYS },
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
 * Send expiring tomorrow urgent warning email
 */
const sendExpiringTomorrowWarning = async (
  subscription: Subscription & { plan: RenewalPlanShape; user: any },
) => {
  if (!subscription.user || !subscription.expiresAt) return;

  if (env.NODE_ENV === "production") {
    await sendUserEmail(
      subscription.user.email,
      "SUBSCRIPTION_EXPIRING_TOMORROW",
      {
        firstName: subscription.user.fullName?.split(" ")[0] || "User",
        planName: subscription.plan.name,
        expiresAt: subscription.expiresAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    );
  }

  // Create notification
  const notification = buildNotification({
    category: "SUBSCRIPTION",
    type: "SUBSCRIPTION_EXPIRED",
    planName: subscription.plan.name,
    status: "warning",
    expiresAt: subscription.expiresAt,
    meta: { planId: subscription.planId, daysRemaining: 1 },
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
 * Send grace period notification email
 */
const sendGracePeriodNotification = async (
  subscription: Subscription & { plan: RenewalPlanShape; user: any },
) => {
  if (
    !subscription.user ||
    !subscription.expiresAt ||
    !subscription.plan.gracePeriod
  )
    return;

  const graceExpiry = new Date(subscription.expiresAt);
  graceExpiry.setDate(graceExpiry.getDate() + subscription.plan.gracePeriod);

  if (env.NODE_ENV === "production") {
    await sendUserEmail(subscription.user.email, "SUBSCRIPTION_GRACE_PERIOD", {
      firstName: subscription.user.fullName?.split(" ")[0] || "User",
      planName: subscription.plan.name,
      expiredAt: subscription.expiresAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      gracePeriodDays: subscription.plan.gracePeriod,
      graceExpiresAt: graceExpiry.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  }

  // Create notification
  const notification = buildNotification({
    category: "SUBSCRIPTION",
    type: "SUBSCRIPTION_EXPIRED",
    planName: subscription.plan.name,
    status: "warning",
    expiresAt: graceExpiry,
    meta: {
      planId: subscription.planId,
      gracePeriod: true,
      graceDays: subscription.plan.gracePeriod,
    },
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
 * Send grace period expired notification email
 */
const sendGracePeriodExpiredNotification = async (
  subscription: Subscription & { plan: RenewalPlanShape; user: any },
) => {
  if (
    !subscription.user ||
    !subscription.expiresAt ||
    !subscription.plan.gracePeriod
  )
    return;

  const graceExpiry = new Date(subscription.expiresAt);
  graceExpiry.setDate(graceExpiry.getDate() + subscription.plan.gracePeriod);

  if (env.NODE_ENV === "production") {
    await sendUserEmail(
      subscription.user.email,
      "SUBSCRIPTION_GRACE_PERIOD_EXPIRED",
      {
        firstName: subscription.user.fullName?.split(" ")[0] || "User",
        planName: subscription.plan.name,
        graceExpiredAt: graceExpiry.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    );
  }

  // Create notification
  const notification = buildNotification({
    category: "SUBSCRIPTION",
    type: "SUBSCRIPTION_EXPIRED",
    planName: subscription.plan.name,
    status: "warning",
    expiresAt: graceExpiry,
    meta: {
      planId: subscription.planId,
      gracePeriodExpired: true,
    },
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
