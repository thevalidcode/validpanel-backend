import flutterwaveProvider from "../../providers/flutterwave.providers";
import paystackProvider from "../../providers/paystack.providers";
import { prisma } from "../../config/db.config";
import { initFlutterwavePayment } from "../../providers/flutterwave.providers";
import { initPaystackPayment } from "../../providers/paystack.providers";
import type { SubscriptionPaymentInput } from "../../schemas/subscription.schema";
import { TransactionType } from "../../../prisma/generated";
import { UserPublic } from "../../schemas/user.schema";
import { Decimal } from "@prisma/client/runtime/library";
import { finalizeSubscriptionPayment } from "./finalize-subscription-payment";

export const createSubscriptionPayment = async (
  user: UserPublic,
  type:
    | "SUBSCRIPTION_PAYMENT"
    | "SUBSCRIPTION_RENEWAL" = "SUBSCRIPTION_PAYMENT",
  input: SubscriptionPaymentInput
) => {
  const { platform, currency, subscriptionId, redirectUrl, billingCycle } =
    input;

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findFirst({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error("Subscription hasn't been created yet");
    }

    const payment = await tx.payment.create({
      data: {
        status: "PENDING",
        planId: subscription.planId,
        amount: subscription.plan.price,
        chargedAmount: subscription.plan.price,
        method: platform,
        currency,
        userId: user.id,
        subscriptionId: subscription.id,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        status: "PENDING",
        amount: subscription.plan.price,
        type,
        currency,
        userUid: user.uid,
        paymentId: payment.id,
      },
    });

    await tx.platformEvent.create({
      data: {
        event: "SUBSCRIPTION_CREATED",
        category: "SUBSCRIPTION",
        entityUid: subscription.uid,
        userId: user.id,
      },
    });

    // FREE PLAN: finalize immediately, no gateway
    if (subscription.plan.price.lte(0)) {
      await finalizeSubscriptionPayment(
        {
          subscriptionId: subscription.id,
          userId: user.id,
          transactionId: transaction.id,
          paymentId: payment.id,
          type,
          amount: new Decimal(0),
          billingCycle,
        },
        tx
      );

      return {
        message: "Subscription activated successfully.",
        url: input.redirectUrl,
      };
    }

    const gateway = await tx.paymentGateway.findFirst({
      where: { platform },
      select: { encryptedSecretKey: true, iv: true, platform: true },
    });

    if (!gateway) {
      throw new Error("Payment gateway not properly configured");
    }

    if (
      gateway.platform !== "MANUAL" &&
      (!gateway.encryptedSecretKey || !gateway.iv)
    ) {
      throw new Error("Payment gateway not properly configured");
    }

    const paymentData = {
      tx_ref: `sub_${subscriptionId}_${Date.now()}`,
      amount: subscription.plan.price,
      currency,
      redirectUrl,
      customer: { email: user.email },
      customizations: {
        title: "Valid Panel Subscription Payment",
      },
      meta: {
        subscriptionId,
        userId: user.id,
        billingCycle,
        type,
        paymentId: payment.id,
        transactionId: transaction.id,
      },
    };

    const parsedSecretKey = {
      encrypted_key: gateway.encryptedSecretKey!,
      iv: gateway.iv!,
    };

    switch (platform) {
      case "FLUTTERWAVE":
        return initFlutterwavePayment(paymentData, parsedSecretKey);

      case "PAYSTACK":
        return initPaystackPayment(paymentData, parsedSecretKey);

      case "MANUAL":
        return {
          message:
            "Pay manually. Our team will verify and activate your subscription.",
          url: input.redirectUrl,
        };

      default:
        throw new Error("Unsupported payment platform");
    }
  });
};

export const upgradePlan = async (
  user: UserPublic,
  input: SubscriptionPaymentInput
) => {
  const {
    platform,
    currency,
    subscriptionId,
    redirectUrl,
    planId,
    billingCycle,
  } = input;

  return prisma.$transaction(async (tx) => {
    const gateway = await tx.paymentGateway.findFirst({
      where: { platform },
      select: { encryptedSecretKey: true, iv: true, platform: true },
    });

    if (!gateway) {
      throw new Error("Payment gateway not properly configured");
    }

    if (
      gateway.platform !== "MANUAL" &&
      (!gateway.encryptedSecretKey || !gateway.iv)
    ) {
      throw new Error("Payment gateway not properly configured");
    }

    const currentSubscription = await tx.subscription.findFirst({
      where: { id: subscriptionId, userId: user.id, status: "ACTIVE" },
      include: { plan: true },
    });

    if (!currentSubscription) {
      throw new Error("Active subscription not found");
    }

    const newPlan = await tx.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!newPlan) {
      throw new Error("Target plan not found");
    }

    const currentPrice = new Decimal(currentSubscription.plan.price);
    const newPrice = new Decimal(newPlan.price);
    const upgradeAmount = newPrice.minus(currentPrice);

    if (upgradeAmount.lte(0)) {
      throw new Error("Invalid upgrade. New plan must cost more");
    }

    const payment = await tx.payment.create({
      data: {
        status: "PENDING",
        planId: newPlan.id,
        amount: upgradeAmount,
        chargedAmount: upgradeAmount,
        method: platform,
        currency,
        userId: user.id,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        status: "PENDING",
        amount: upgradeAmount,
        type: "SUBSCRIPTION_UPGRADE",
        currency,
        userUid: user.uid,
      },
    });

    await tx.platformEvent.create({
      data: {
        event: "SUBSCRIPTION_UPGRADE",
        category: "SUBSCRIPTION",
        entityUid: currentSubscription.uid,
        userId: user.id,
      },
    });

    const paymentData = {
      tx_ref: `upgrade_${subscriptionId}_${Date.now()}`,
      amount: upgradeAmount.toNumber(),
      currency,
      redirectUrl,
      customer: { email: user.email },
      customizations: {
        title: "Valid Panel Subscription Upgrade",
      },
      meta: {
        subscriptionId,
        newPlanId: newPlan.id,
        userId: user.id,
        type: "SUBSCRIPTION_UPGRADE" as TransactionType,
        paymentId: payment.id,
        transactionId: transaction.id,
        billingCycle,
      },
    };

    const parsedSecretKey = {
      encrypted_key: gateway.encryptedSecretKey!,
      iv: gateway.iv!,
    };

    switch (platform) {
      case "FLUTTERWAVE":
        return initFlutterwavePayment(paymentData, parsedSecretKey);

      case "PAYSTACK":
        return initPaystackPayment(paymentData, parsedSecretKey);

      case "MANUAL":
        return {
          message:
            "Pay manually. Our team will verify and complete your upgrade.",
          url: input.redirectUrl,
        };

      default:
        throw new Error("Unsupported payment platform");
    }
  });
};

const handleFlutterwaveSuccess = async (data: any, customer: any) => {
  return await flutterwaveProvider.processSuccess(data, customer);
};

const handleFlutterwaveFailure = async (data: any, customer: any) => {
  return await flutterwaveProvider.processFailure(data, customer);
};

const handlePaystackSuccess = async (data: any, customer: any) => {
  return await paystackProvider.processSuccess(data, customer);
};

const handlePaystackFailure = async (data: any, customer: any) => {
  return await paystackProvider.processFailure(data, customer);
};

export default {
  handleFlutterwaveSuccess,
  handleFlutterwaveFailure,
  handlePaystackSuccess,
  handlePaystackFailure,
};
