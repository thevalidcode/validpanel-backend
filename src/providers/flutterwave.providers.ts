import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import { Decimal } from "@prisma/client/runtime/library";

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string }
) => {
  const exchangeRates = await prisma.currency.findFirst({
    select: { quotes: true },
  });
  const convertedUSDAmount = convertCurrency(
    paymentData.amount,
    paymentData.currency,
    "NGN",
    exchangeRates?.quotes!
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

const processSuccess = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  // Calculate expiry date based on interval
  let expiresAt: Date;
  const now = new Date();
  const subscription = await prisma.subscription.findUnique({
    where: { id: data.meta.subscriptionId },
    include: { plan: true },
  });

  if (!subscription || subscription.userId !== data.meta.userId) {
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
      where: { id: data.meta.subscriptionId },
      data: {
        status: "ACTIVE",
        startedAt: new Date(),
        expiresAt,
      },
    });

    await tx.transaction.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        amount: data.amount,
        type: data.meta.type,
        currency: data.currency,
        userUid: user.uid,
      },
    });
    await tx.payment.create({
      data: {
        uid: uuidv4(),
        status: "SUCCESS",
        planId: subscription.planId,
        amount: data.amount,
        method: "FLUTTERWAVE",
        currency: data.currency,
        chargedAmount: data.charged_amount,
        userId: user.id,
      },
    });

    // Update user onboarding step → move forward
    if (
      user.onboardingStep !== "COMPLETE" &&
      (data.meta.type === "SUBSCRIPTION_PAYMENT" ||
        data.meta.type === "SUBSCRIPTION_RENEWAL")
    ) {
      await tx.user.update({
        where: { id: data.meta.userId },
        data: { onboardingStep: "STORE_DETAILS" },
      });
    }
  });

  // Optional: send email notification
};

const processFailure = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["customer"]
) => {
  const user = await prisma.user.findFirst({
    where: { email: customer.email },
  });

  if (!user) throw new Error("User not found");

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: data.meta.subscriptionId },
      data: {
        status: "FAILED",
      },
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
        amount: new Decimal(data.amount / 100),
        type: data.meta.type,
        currency: data.currency,
        userUid: user.uid,
      },
    });

    await tx.payment.create({
      data: {
        uid: crypto.randomUUID(),
        status: "FAILED",
        planId: subscription.planId,
        amount: new Decimal(data.amount / 100),
        method: "FLUTTERWAVE",
        currency: data.currency,
        chargedAmount: new Decimal(data.amount / 100),
        userId: user.id,
      },
    });
  });
};

export default { processSuccess, processFailure };
