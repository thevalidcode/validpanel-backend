import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { Decimal } from "@prisma/client/runtime/client";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import { buildNotification } from "../services/notification.services";
import { calculateExpiryForUpgrade } from "../utils/calculateExpiresAt";
import { sendUserEmail, sendEmailToAdmins } from "../emails";
import { env } from "../config/env.config";

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRates = await prisma.exchangeRate.findFirst({
    select: { rates: true },
  });
  const convertedNGNAmount = convertCurrency(
    paymentData.amount,
    "USD",
    "NGN",
    exchangeRates?.rates!
  );
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: paymentData.customer.email,
      amount: convertedNGNAmount * 100, // Paystack uses kobo
      currency: "NGN",
      callback_url: paymentData.redirect_url,
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
    where: {
      id: data.metadata.subscriptionId,
      userId: user.id,
      status: "PENDING",
    },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
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
    const activeSubscription = await prisma.subscription.findFirst({
      where: { status: "ACTIVE", userId: user.id },
      include: { plan: true },
    });

    if (
      !data.metadata.newPlanId ||
      !data.metadata.billingCycle ||
      !activeSubscription
    ) {
      throw new Error("Upgrade metadata missing");
    }

    planId = data.metadata.newPlanId;
    billingCycle = data.metadata.billingCycle;

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
      data.metadata.billingCycle === "YEARLY"
        ? new Date(new Date(baseDate).setFullYear(baseDate.getFullYear() + 1))
        : new Date(new Date(baseDate).setMonth(baseDate.getMonth() + 1));
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

  // Send payment success email in production
  if (env.NODE_ENV === "production") {
    await sendUserEmail(user.email, "PAYMENT_SUCCESS", {
      firstName: user.fullName?.split(" ")[0] || "User",
      amount: amount.toFixed(2),
      currency: data.currency,
      planName: subscription.plan.name,
      transactionId: data.reference || String(data.metadata.transactionId),
      paymentMethod: "Paystack",
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
      amount: amount.toFixed(2),
      currency: data.currency,
      planName: subscription.plan.name,
      transactionId: data.reference || String(data.metadata.transactionId),
      paymentMethod: "Paystack",
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
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");
  const amountInDecimal = new Decimal(data.amount / 100);

  let subscriptionPlanName = "";

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: data.metadata.subscriptionId },
      data: {
        status: "FAILED",
      },
      include: { plan: true },
    });

    subscriptionPlanName = subscription.plan.name;

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

  // Send payment failed email in production
  if (env.NODE_ENV === "production") {
    await sendUserEmail(user.email, "PAYMENT_FAILED", {
      firstName: user.fullName?.split(" ")[0] || "User",
      amount: amountInDecimal.toFixed(2),
      currency: data.currency,
      planName: subscriptionPlanName,
      reason: data.status === "reversed" ? "Payment was reversed" : "Payment declined",
      paymentDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
  }
};

export default { processSuccess, processFailure };
