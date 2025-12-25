import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { Decimal } from "@prisma/client/runtime/library";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import { buildNotification } from "../services/notification.services";
import { calculateExpiryForUpgrade } from "../utils/calculateExpiresAt";

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRates = await prisma.exchangeRate.findFirst({
    select: { rates: true },
  });
  const convertedNGNAmount = convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN",
    exchangeRates?.rates!
  );
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: paymentData.customer.email,
      amount: convertedNGNAmount * 100, // Paystack uses kobo
      currency: "NGN",
      callback_url: paymentData.redirectUrl,
      metadata: paymentData.meta,
    },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encrypted_key,
          secretKey.iv
        )}`,
      },
    }
  );
  return { url: response.data.data.authorization_url };
};

const processSuccess = async (
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });
  if (!user) throw new Error("User not found");

  const subscription = await prisma.subscription.findUnique({
    where: { id: data.metadata.subscriptionId },
    include: { plan: true },
  });
  if (!subscription || subscription.userId !== data.metadata.userId) {
    throw new Error("Subscription not found");
  }

  if (subscription.status !== "PENDING") {
    return; // idempotency safeguard
  }

  const isUpgrade = data.metadata.type === "SUBSCRIPTION_UPGRADE";
  const isDowngrade = data.metadata.type === "SUBSCRIPTION_DOWNGRADE";
  const isRenewal =
    data.metadata.type === "SUBSCRIPTION_RENEWAL" ||
    data.metadata.type === "SUBSCRIPTION_PAYMENT";

  let expiresAt = subscription.expiresAt;
  let planId = subscription.planId;
  let billingCycle = subscription.billingCycle;

  if (isUpgrade) {
    if (!data.metadata.newPlanId || !data.metadata.billingCycle) {
      throw new Error("Upgrade metadata missing");
    }

    planId = data.metadata.newPlanId;
    billingCycle = data.metadata.billingCycle;

    expiresAt = calculateExpiryForUpgrade({
      currentSubscription: subscription,
      newBillingCycle: billingCycle,
    });
  }

  if (isRenewal) {
    const now = new Date();
    expiresAt =
      data.metadata.billingCycle === "YEARLY"
        ? new Date(now.setFullYear(now.getFullYear() + 1))
        : new Date(now.setMonth(now.getMonth() + 1));
  }

  const amount = new Decimal(data.amount / 100); // Paystack uses kobo
  // Downgrade success does NOT touch expiry or plan immediately

  await prisma.$transaction(async (tx) => {
    const updatedSubscription = await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "ACTIVE",
        planId,
        billingCycle,
        expiresAt,
        pendingPlanId: isDowngrade ? subscription.pendingPlanId : null,
        startedAt: isRenewal ? new Date() : subscription.startedAt,
      },
      include: { plan: true },
    });

    await tx.transaction.update({
      where: { id: data.metadata.transactionId },
      data: { status: "SUCCESS" },
    });

    await tx.payment.update({
      where: { id: data.metadata.paymentId },
      data: { status: "SUCCESS" },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type: data.metadata.type,
      planName: updatedSubscription.plan.name,
      expiresAt,
      status: "success",
      meta: {
        amount,
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
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.amount / 100);
  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: data.metadata.subscriptionId },
      data: {
        status: "FAILED",
      },
      include: { plan: true },
    });
    await tx.transaction.update({
      where: { id: data.metadata.transactionId },
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
      where: { id: data.metadata.paymentId },
      data: {
        status: "FAILED",
      },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type: data.metadata.type,
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
