import { prisma } from "../config/db.config";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import { Decimal } from "@prisma/client/runtime/client";
import { buildNotification } from "../services/notification.services";
import { calculateExpiryForUpgrade } from "../utils/calculateExpiresAt";
import convertCurrency from "../utils/ConvertCurrency";
import { sendUserEmail, sendEmailToAdmins } from "../emails";
import { env } from "../config/env.config";

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRate = await prisma.exchangeRate.findFirst({
    select: { rates: true },
  });

  if (!exchangeRate) {
    throw new Error("Exchange rate not found");
  }

  const convertedAmount = convertCurrency(
    paymentData.amount,
    "USD",
    paymentData.currency,
    exchangeRate?.rates!
  );

  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    { ...paymentData, amount: convertedAmount },
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
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });
  if (!user) throw new Error("User not found");

  const subscription = await prisma.subscription.findUnique({
    where: {
      id: data.meta_data.subscriptionId,
      userId: user.id,
      status: "PENDING",
    },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const isUpgrade = data.meta_data.type === "SUBSCRIPTION_UPGRADE";
  const isDowngrade = data.meta_data.type === "SUBSCRIPTION_DOWNGRADE";
  const isRenewal =
    data.meta_data.type === "SUBSCRIPTION_RENEWAL" ||
    data.meta_data.type === "SUBSCRIPTION_PAYMENT";

  let expiresAt = subscription.expiresAt;
  let planId = subscription.planId;
  let billingCycle = subscription.billingCycle;

  if (isUpgrade) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: { status: "ACTIVE", userId: user.id },
      include: { plan: true },
    });

    if (
      !data.meta_data.newPlanId ||
      !data.meta_data.billingCycle ||
      !activeSubscription
    ) {
      throw new Error("Upgrade metadata missing");
    }

    planId = data.meta_data.newPlanId;
    billingCycle = data.meta_data.billingCycle;

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
      data.meta_data.billingCycle === "YEARLY"
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
      where: { id: data.meta_data.transactionId },
      data: { status: "SUCCESS" },
    });

    await tx.payment.update({
      where: { id: data.meta_data.paymentId },
      data: { status: "SUCCESS" },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type: data.meta_data.type,
      planName: subscription.plan.name,
      expiresAt,
      status: "success",
      meta: {
        amount: data.data.amount,
        currency: data.data.currency,
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

  // Send payment success email in production
  if (env.NODE_ENV === "production") {
    const amountInDecimal = new Decimal(data.data.amount / 100);
    await sendUserEmail(user.email, "PAYMENT_SUCCESS", {
      firstName: user.fullName?.split(" ")[0] || "User",
      amount: amountInDecimal.toFixed(2),
      currency: data.data.currency,
      planName: subscription.plan.name,
      transactionId: data.data.tx_ref || String(data.meta_data.transactionId),
      paymentMethod: "Flutterwave",
      paymentDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    // Send admin notification
    await sendEmailToAdmins("ADMIN_PAYMENT_RECEIVED", {
      storeName: "N/A",
      storeId: "N/A",
      ownerName: user.fullName || "Unknown",
      ownerEmail: user.email,
      amount: amountInDecimal.toFixed(2),
      currency: data.data.currency,
      planName: subscription.plan.name,
      transactionId: data.data.tx_ref || String(data.meta_data.transactionId),
      paymentMethod: "Flutterwave",
      receivedAt: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  }
};

const processFailure = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.data.amount / 100);

  let subscriptionPlanName = "";

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: data.meta_data.subscriptionId },
      data: {
        status: "FAILED",
      },
      include: { plan: true },
    });

    subscriptionPlanName = subscription.plan.name;

    await tx.transaction.update({
      where: { id: data.meta_data.transactionId },
      data: {
        status:
          data.data.status === "reversed"
            ? "REVERSED"
            : data.data.status === "cancelled"
            ? "CANCELLED"
            : "FAILED",
      },
    });

    await tx.payment.update({
      where: { id: data.meta_data.paymentId },
      data: {
        status: "FAILED",
      },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type: data.meta_data.type,
      planName: subscription.plan.name,
      status: "failed",
      meta: { amount: amountInDecimal, currency: data.data.currency },
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

  // Send payment failed email in production
  if (env.NODE_ENV === "production") {
    await sendUserEmail(user.email, "PAYMENT_FAILED", {
      firstName: user.fullName?.split(" ")[0] || "User",
      amount: amountInDecimal.toFixed(2),
      currency: data.data.currency,
      planName: subscriptionPlanName,
      reason: data.data.status === "reversed" ? "Payment was reversed" : "Payment declined",
      paymentDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  }
};

export default { processSuccess, processFailure };
