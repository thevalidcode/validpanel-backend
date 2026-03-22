import flutterwaveProvider from "../../providers/flutterwave.providers";
import paystackProvider from "../../providers/paystack.providers";
import { prisma } from "../../config/db.config";
import { initFlutterwavePayment } from "../../providers/flutterwave.providers";
import { initPaystackPayment } from "../../providers/paystack.providers";
import type { SubscriptionPaymentInput } from "../../schemas/subscription.schema";
import { CouponAppliesTo, TransactionType } from "../../../prisma/generated";
import { UserPublic } from "../../schemas/user.schema";
import { Decimal } from "@prisma/client/runtime/client";
import { finalizeSubscriptionPayment } from "./finalize-subscription-payment";
import { sendUserEmail, sendEmailToAdmins } from "../../emails";
import { env } from "../../config/env.config";
import { resolvePriceForSubscription } from "./pricing-resolution";
import {
  computeCouponDiscountAmount,
  computePricingBreakdown,
} from "../../core/pricing/pricing-core";

const ZERO = new Decimal(0);

const applyCouponToAmount = async (
  tx: any,
  params: {
    couponCode?: string;
    amount: Decimal;
    currency: string;
    userId: number;
    planId: number;
    billingCycle: "MONTHLY" | "YEARLY";
    appliesTo: CouponAppliesTo;
  },
) => {
  const {
    couponCode,
    amount,
    currency,
    userId,
    planId,
    billingCycle,
    appliesTo,
  } = params;

  if (!couponCode) {
    return {
      coupon: null,
      discountAmount: ZERO,
    };
  }

  const coupon = await tx.coupon.findUnique({
    where: { code: couponCode },
    include: { rules: true },
  });

  if (!coupon || !coupon.isActive) {
    throw new Error("Invalid or inactive coupon");
  }

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    throw new Error("Coupon is not active yet");
  }
  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new Error("Coupon has expired");
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new Error("Coupon usage limit reached");
  }

  if (coupon.perUserLimit) {
    const userRedemptions = await tx.couponRedemption.count({
      where: { couponId: coupon.id, userId },
    });
    if (userRedemptions >= coupon.perUserLimit) {
      throw new Error("Per-user coupon limit reached");
    }
  }

  if (coupon.firstTimeOnly) {
    const hasPayment = await tx.payment.count({
      where: { userId, status: "SUCCESS" },
    });
    if (hasPayment > 0) {
      throw new Error("Coupon is only valid for first-time payments");
    }
  }

  if (coupon.appliesTo.length && !coupon.appliesTo.includes(appliesTo)) {
    throw new Error(`Coupon is not valid for ${appliesTo.toLowerCase()} flow`);
  }

  const matchingRule = coupon.rules.length
    ? coupon.rules.find(
        (rule: any) =>
          (!rule.planId || rule.planId === planId) &&
          (!rule.interval || rule.interval === billingCycle) &&
          (!rule.currency || rule.currency === currency),
      )
    : true;

  if (!matchingRule) {
    throw new Error("Coupon does not apply to this plan/interval/currency");
  }

  let discountAmount = ZERO;
  if (
    coupon.type === "FIXED" &&
    coupon.currency &&
    coupon.currency !== currency
  ) {
    throw new Error("Coupon currency does not match payment currency");
  }

  discountAmount = computeCouponDiscountAmount(
    amount,
    currency,
    {
      type: coupon.type,
      value: coupon.value,
      currency: coupon.currency,
    },
    true,
  );

  return {
    coupon,
    discountAmount,
  };
};

export const createSubscriptionPayment = async (
  user: UserPublic,
  type:
    | "SUBSCRIPTION_PAYMENT"
    | "SUBSCRIPTION_RENEWAL" = "SUBSCRIPTION_PAYMENT",
  input: SubscriptionPaymentInput,
) => {
  const { platform, currency, subscriptionId, redirectUrl, billingCycle } =
    input;

  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findFirst({
      where: { id: subscriptionId, userId: user.id, status: "PENDING" },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error("Pending subscription not found");
    }

    const resolvedPrice = await resolvePriceForSubscription({
      planId: subscription.planId,
      interval: billingCycle,
      currency,
    });

    const amount = new Decimal(resolvedPrice.price);

    const couponResult = await applyCouponToAmount(tx, {
      couponCode: input.couponCode,
      amount,
      currency,
      userId: user.id,
      planId: subscription.planId,
      billingCycle,
      appliesTo: type === "SUBSCRIPTION_RENEWAL" ? "RENEWAL" : "NEW",
    });

    const breakdown = computePricingBreakdown({
      subtotal: amount,
      taxRate: resolvedPrice.tax ?? 0,
      couponApplied: Boolean(couponResult.coupon),
      couponDiscountAmount: couponResult.discountAmount,
      subtotalCurrency: currency,
    });

    const taxAmount = new Decimal(breakdown.taxAmount);
    const finalAmount = new Decimal(breakdown.total);

    const payment = await tx.payment.create({
      data: {
        status: "PENDING",
        planId: subscription.planId,
        amount,
        chargedAmount: finalAmount,
        discountAmount: couponResult.discountAmount,
        taxAmount,
        finalAmount,
        couponId: couponResult.coupon?.id,
        method: platform,
        currency,
        userId: user.id,
        subscriptionId: subscription.id,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        status: "PENDING",
        amount: finalAmount,
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
    if (finalAmount.lte(0)) {
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
        tx,
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
      tx_ref: payment.uid,
      amount: finalAmount.toNumber(),
      currency,
      redirect_url:
        redirectUrl + `?status=success&platform=${platform.toLowerCase()}`,
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
        if (finalAmount.lessThan(1)) {
          throw new Error(
            "Minimum amount for Flutterwave is 1 unit of the currency",
          );
        }
        return initFlutterwavePayment(paymentData, parsedSecretKey);

      case "PAYSTACK":
        return initPaystackPayment(paymentData, parsedSecretKey);

      case "MANUAL":
        // Send manual payment pending emails in production
        if (env.NODE_ENV === "production") {
          await sendUserEmail(user.email, "PAYMENT_PENDING_MANUAL", {
            firstName: user.fullName?.split(" ")[0] || "User",
            amount: finalAmount,
            currency,
            planName: subscription.plan.name,
            paymentReference: payment.uid,
          });

          await sendEmailToAdmins("ADMIN_MANUAL_PAYMENT_PENDING", {
            storeName: "N/A",
            storeId: "N/A",
            ownerName: user.fullName || "Unknown",
            ownerEmail: user.email,
            amount: finalAmount,
            currency,
            planName: subscription.plan.name,
            paymentReference: payment.uid,
            submittedAt: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }

        return {
          message:
            "Pay manually. Our team will verify and activate your subscription.",
          url: `${input.redirectUrl}?platform=manual`,
        };

      default:
        throw new Error("Unsupported payment platform");
    }
  });
};

export const upgradePlan = async (
  user: UserPublic,
  input: SubscriptionPaymentInput,
) => {
  const { platform, currency, subscriptionId, redirectUrl, billingCycle } =
    input;

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
      where: { userId: user.id, status: "ACTIVE" },
      include: { plan: true },
    });

    const newSubscription = await tx.subscription.findFirst({
      where: { id: subscriptionId, userId: user.id, status: "PENDING" },
      include: { plan: true },
    });

    if (!newSubscription) {
      throw new Error("Pending subscription not found");
    }

    if (!currentSubscription) {
      throw new Error("Active subscription not found");
    }

    if (!newSubscription || !newSubscription.plan) {
      throw new Error("Target plan not found");
    }

    const targetPrice = await resolvePriceForSubscription({
      planId: newSubscription.planId,
      interval: billingCycle,
      currency,
    });
    const currentPrice = await resolvePriceForSubscription({
      planId: currentSubscription.planId,
      interval: currentSubscription.billingCycle,
      currency,
    });

    const payableBeforeTax = new Decimal(targetPrice.price).minus(
      new Decimal(currentPrice.price),
    );

    if (payableBeforeTax.lte(0)) {
      throw new Error("Invalid upgrade. New plan must cost more");
    }

    const couponResult = await applyCouponToAmount(tx, {
      couponCode: input.couponCode,
      amount: payableBeforeTax,
      currency,
      userId: user.id,
      planId: newSubscription.planId,
      billingCycle,
      appliesTo: "UPGRADE",
    });

    const breakdown = computePricingBreakdown({
      subtotal: payableBeforeTax,
      taxRate: targetPrice.tax ?? 0,
      couponApplied: Boolean(couponResult.coupon),
      couponDiscountAmount: couponResult.discountAmount,
      subtotalCurrency: currency,
    });

    const taxAmount = new Decimal(breakdown.taxAmount);
    const finalAmount = new Decimal(breakdown.total);
    const upgradeAmount = payableBeforeTax;

    const payment = await tx.payment.create({
      data: {
        status: "PENDING",
        planId: newSubscription.plan.id,
        amount: upgradeAmount,
        chargedAmount: finalAmount,
        discountAmount: couponResult.discountAmount,
        taxAmount,
        finalAmount,
        couponId: couponResult.coupon?.id,
        method: platform,
        subscriptionId: newSubscription.id,
        currency,
        userId: user.id,
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        status: "PENDING",
        amount: finalAmount,
        paymentId: payment.id,
        type: "SUBSCRIPTION_UPGRADE",
        currency,
        userUid: user.uid,
      },
    });

    await tx.platformEvent.create({
      data: {
        event: "SUBSCRIPTION_UPGRADE",
        category: "SUBSCRIPTION",
        entityUid: newSubscription.uid,
        userId: user.id,
      },
    });

    const paymentData = {
      tx_ref: payment.uid,
      amount: finalAmount.toNumber(),
      currency,
      redirect_url: redirectUrl,
      customer: { email: user.email },
      customizations: {
        title: "Valid Panel Subscription Upgrade",
      },
      meta: {
        subscriptionId,
        newPlanId: newSubscription.plan.id,
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
        // Send manual upgrade payment pending emails in production
        if (env.NODE_ENV === "production") {
          await sendUserEmail(user.email, "PAYMENT_PENDING_MANUAL", {
            firstName: user.fullName?.split(" ")[0] || "User",
            amount: finalAmount,
            currency,
            planName: newSubscription.plan.name,
            paymentReference: payment.uid,
          });

          await sendEmailToAdmins("ADMIN_MANUAL_PAYMENT_PENDING", {
            storeName: "N/A",
            storeId: "N/A",
            ownerName: user.fullName || "Unknown",
            ownerEmail: user.email,
            amount: finalAmount,
            currency,
            planName: newSubscription.plan.name,
            paymentReference: payment.uid,
            submittedAt: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }

        return {
          message:
            "Pay manually. Our team will verify and complete your upgrade.",
          url: `${input.redirectUrl}?platform=manual`,
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
