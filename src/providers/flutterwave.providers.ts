import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import { Decimal } from "@prisma/client/runtime/library";
import { buildNotification } from "../services/notification.services";
import { calculateExpiryForUpgrade } from "../utils/calculateExpiresAt";

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRates = await prisma.exchangeRate.findFirst({
    select: { rates: true },
  });
  const convertedUSDAmount = convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN",
    exchangeRates?.rates!
  );
  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    { ...paymentData, amount: convertedUSDAmount },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encrypted_key,
          secretKey.iv
        )}`,
      },
    }
  );
  return { url: response.data.data.link };
};

export const processSuccess = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });
  if (!user) throw new Error("User not found");

  const subscription = await prisma.subscription.findUnique({
    where: {
      id: data.meta.subscriptionId,
      userId: user.id,
      status: "PENDING",
    },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const isUpgrade = data.meta.type === "SUBSCRIPTION_UPGRADE";
  const isDowngrade = data.meta.type === "SUBSCRIPTION_DOWNGRADE";
  const isRenewal =
    data.meta.type === "SUBSCRIPTION_RENEWAL" ||
    data.meta.type === "SUBSCRIPTION_PAYMENT";

  let expiresAt = subscription.expiresAt;
  let planId = subscription.planId;
  let billingCycle = subscription.billingCycle;

  if (isUpgrade) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: { status: "ACTIVE", userId: user.id },
      include: { plan: true },
    });

    if (
      !data.meta.newPlanId ||
      !data.meta.billingCycle ||
      !activeSubscription
    ) {
      throw new Error("Upgrade metadata missing");
    }

    planId = data.meta.newPlanId;
    billingCycle = data.meta.billingCycle;

    expiresAt = calculateExpiryForUpgrade({
      currentSubscription: activeSubscription,
      newBillingCycle: billingCycle,
    });

    // Expire any existing ACTIVE subscriptions to avoid unique constraint violation
    await prisma.subscription.updateMany({
      where: {
        userId: user.id,
        status: "ACTIVE",
        NOT: { id: subscription.id },
      },
      data: { status: "EXPIRED" },
    });
  }

  if (isRenewal) {
    const baseDate =
      subscription.expiresAt && subscription.expiresAt > new Date()
        ? subscription.expiresAt
        : new Date();

    expiresAt =
      data.meta.billingCycle === "YEARLY"
        ? new Date(new Date(baseDate).setFullYear(baseDate.getFullYear() + 1))
        : new Date(new Date(baseDate).setMonth(baseDate.getMonth() + 1));
  }

  // Downgrade success does NOT touch expiry or plan immediately

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        planId,
        billingCycle,
        expiresAt,
        pendingPlanId: isDowngrade ? subscription.pendingPlanId : null,
        startedAt: isRenewal ? new Date() : subscription.startedAt,
      },
    });

    await tx.transaction.update({
      where: { id: data.meta.transactionId },
      data: { status: "SUCCESS" },
    });

    await tx.payment.update({
      where: { id: data.meta.paymentId },
      data: { status: "SUCCESS" },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type: data.meta.type,
      planName: subscription.plan.name,
      expiresAt,
      status: "success",
      meta: {
        amount: data.amount,
        currency: data.currency,
        previousPlanId: subscription.planId,
        newPlanId: planId,
      },
    });

    await tx.notification.create({
      data: {
        category: notificationDetails.category,
        title: notificationDetails.title,
        message: notificationDetails.message,
        userId: user.id,
        meta: notificationDetails.meta,
      },
    });
  });
};

const processFailure = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.amount / 100);
  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: data.meta.subscriptionId },
      data: {
        status: "FAILED",
      },
      include: { plan: true },
    });
    await tx.transaction.update({
      where: { id: data.meta.transactionId },
      data: {
        status:
          data.status === "reversed"
            ? "REVERSED"
            : data.status === "cancelled"
            ? "CANCELLED"
            : "FAILED",
      },
    });

    await tx.payment.update({
      where: { id: data.meta.paymentId },
      data: {
        status: "FAILED",
      },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type: data.meta.type,
      planName: subscription.plan.name,
      status: "failed",
      meta: { amount: amountInDecimal, currency: data.currency },
    });

    await tx.notification.create({
      data: {
        category: notificationDetails.category,
        title: notificationDetails.title,
        message: notificationDetails.message,
        userId: user.id,
        meta: notificationDetails.meta,
      },
    });
  });
};

export default { processSuccess, processFailure };
