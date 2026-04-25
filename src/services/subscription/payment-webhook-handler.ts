import { Decimal } from "@prisma/client/runtime/client";
import { BillingInterval, PaymentMethod, TransactionType } from "../../../prisma/generated";
import { prisma } from "../../config/db.config";
import { sendEmailToAdmins, sendUserEmail } from "../../emails";
import { buildNotification } from "../notification.services";
import { finalizeSubscriptionPayment } from "./finalize-subscription-payment";
import { env } from "../../config/env.config";

interface SubscriptionWebhookMeta {
  subscriptionId: number;
  type: TransactionType;
  billingCycle: BillingInterval;
  userId: number;
  paymentId: number;
  newPlanId?: number | null;
  transactionId: number;
  couponCode?: string | null;
}

interface HandleSuccessInput {
  customerEmail: string;
  amount: number;
  amountIsMinor: boolean;
  currency: string;
  meta: SubscriptionWebhookMeta;
  paymentMethod: PaymentMethod;
  transactionReference: string;
}

interface HandleFailureInput {
  customerEmail: string;
  amount: number;
  amountIsMinor: boolean;
  currency: string;
  meta: SubscriptionWebhookMeta;
  paymentStatus: string;
}

const formatLongDateTime = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatLongDate = () =>
  new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export async function handleSubscriptionGatewaySuccess({
  customerEmail,
  amount,
  amountIsMinor,
  currency,
  meta,
  paymentMethod,
  transactionReference,
}: HandleSuccessInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: meta.userId },
  });

  if (!user || user.email !== customerEmail) {
    throw new Error("User not found");
  }

  const normalizedAmount = amountIsMinor
    ? new Decimal(amount).div(100)
    : new Decimal(amount);

  await finalizeSubscriptionPayment({
    subscriptionId: meta.subscriptionId,
    userId: user.id,
    transactionId: meta.transactionId,
    paymentId: meta.paymentId,
    type: meta.type,
    amount: normalizedAmount,
    billingCycle: meta.billingCycle,
    newPlanId: meta.newPlanId ?? undefined,
  });

  if (env.NODE_ENV !== "production") {
    return;
  }

  const payment = await prisma.payment.findUnique({
    where: { id: meta.paymentId },
    include: { plan: true },
  });

  if (!payment || !payment.plan) {
    throw new Error("Payment not found");
  }

  const amountString = normalizedAmount.toFixed(2);

  await sendUserEmail(user.email, "PAYMENT_SUCCESS", {
    firstName: user.fullName?.split(" ")[0] || "User",
    amount: amountString,
    currency,
    planName: payment.plan.name,
    transactionId: transactionReference,
    paymentMethod,
    paymentDate: formatLongDateTime(),
  });

  await sendEmailToAdmins("ADMIN_PAYMENT_RECEIVED", {
    storeName: "N/A",
    storeId: "N/A",
    ownerName: user.fullName || "Unknown",
    ownerEmail: user.email,
    amount: amountString,
    currency,
    planName: payment.plan.name,
    transactionId: transactionReference,
    paymentMethod,
    receivedAt: formatLongDateTime(),
  });
}

export async function handleSubscriptionGatewayFailure({
  customerEmail,
  amount,
  amountIsMinor,
  currency,
  meta,
  paymentStatus,
}: HandleFailureInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: meta.userId },
  });

  if (!user || user.email !== customerEmail) {
    throw new Error("User not found");
  }

  const amountInDecimal = amountIsMinor
    ? new Decimal(amount).div(100)
    : new Decimal(amount);

  let subscriptionPlanName = "";

  await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.update({
      where: { id: meta.subscriptionId },
      data: { status: "FAILED" },
      include: { plan: true },
    });

    subscriptionPlanName = subscription.plan.name;

    await tx.transaction.update({
      where: { id: meta.transactionId },
      data: {
        status:
          paymentStatus === "reversed"
            ? "REVERSED"
            : paymentStatus === "cancelled"
              ? "CANCELLED"
              : "FAILED",
      },
    });

    await tx.payment.update({
      where: { id: meta.paymentId },
      data: { status: "FAILED" },
    });

    const notificationDetails = buildNotification({
      category: "PAYMENT",
      type: meta.type,
      planName: subscription.plan.name,
      status: "failed",
      meta: { amount: amountInDecimal, currency },
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

  if (env.NODE_ENV !== "production") {
    return;
  }

  await sendUserEmail(user.email, "PAYMENT_FAILED", {
    firstName: user.fullName?.split(" ")[0] || "User",
    amount: amountInDecimal.toFixed(2),
    currency,
    planName: subscriptionPlanName,
    reason: paymentStatus === "reversed" ? "Payment was reversed" : "Payment declined",
    paymentDate: formatLongDate(),
  });
}
