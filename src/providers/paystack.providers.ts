import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { Decimal } from "@prisma/client/runtime/library";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import { buildNotification } from "../services/notification.services";

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRates = await prisma.currency.findFirst({
    select: { quotes: true },
  });
  const convertedNGNAmount = convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN",
    exchangeRates?.quotes!
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

  const amount = new Decimal(data.amount / 100); // Paystack uses kobo

  // Calculate expiry date based on interval
  let expiresAt: Date;
  const now = new Date();
  const subscription = await prisma.subscription.findUnique({
    where: { id: data.metadata.subscriptionId },
    include: { plan: true },
  });

  if (!subscription || subscription.userId !== data.metadata.userId) {
    throw new Error("Subscription not found");
  }

  if (subscription.status !== "PENDING") {
    throw new Error("Subscription is not pending");
  }

  if (subscription.plan.interval === "MONTHLY") {
    expiresAt = new Date(now.setMonth(now.getMonth() + 1));
  } else if (subscription.plan.interval === "YEARLY") {
    expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
  }

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: data.metadata.subscriptionId },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
        expiresAt,
      },
      include: { plan: true },
    });

    await tx.transaction.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount,
        type: data.metadata.type,
        currency: data.currency,
        userUid: user.uid,
      },
    });
    await tx.payment.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        planId: subscription.planId,
        amount,
        method: "PAYSTACK",
        currency: data.currency,
        chargedAmount: amount,
        userId: user.id,
      },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type:
        data.metadata.type === "SUBSCRIPTION_RENEWAL"
          ? "SUBSCRIPTION_RENEWAL"
          : "SUBSCRIPTION_PAYMENT",
      planName: subscription.plan.name,
      expiresAt,
      status: "success",
      meta: { amount },
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

    // Update user onboarding step → move forward
    if (
      user.onboardingStep !== "COMPLETE" &&
      (data.metadata.type === "SUBSCRIPTION_PAYMENT" ||
        data.metadata.type === "SUBSCRIPTION_RENEWAL")
    ) {
      await tx.user.update({
        where: { id: data.metadata.userId },
        data: { onboardingStep: "STORE_DETAILS" },
      });
    }
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
    await tx.transaction.create({
      data: {
        uid: crypto.randomUUID(),
        status:
          data.status === "reversed"
            ? "REVERSED"
            : data.status === "cancelled"
            ? "CANCELLED"
            : "FAILED",
        amount: amountInDecimal,
        type: data.metadata.type,
        currency: data.currency,
        userUid: user.uid,
      },
    });

    await tx.payment.create({
      data: {
        uid: crypto.randomUUID(),
        status: "FAILED",
        planId: subscription.planId,
        amount: amountInDecimal,
        method: "PAYSTACK",
        currency: data.currency,
        chargedAmount: amountInDecimal,
        userId: user.id,
      },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type:
        data.metadata.type === "SUBSCRIPTION_RENEWAL"
          ? "SUBSCRIPTION_RENEWAL"
          : "SUBSCRIPTION_PAYMENT",
      planName: subscription.plan.name,
      status: "failed",
      meta: { amount: amountInDecimal },
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
