import { prisma } from "../../config/db.config";
import { Decimal } from "@prisma/client/runtime/client";
import { TransactionType } from "../../../prisma/generated";
import { calculateExpiryForUpgrade } from "../../utils/calculateExpiresAt";
import { buildNotification } from "../notification.services";
import { Prisma } from "../../../prisma/generated";
import { sendUserEmail, sendEmailToAdmins } from "../../emails";
import { env } from "../../config/env.config";

interface FinalizeSubscriptionPaymentInput {
  subscriptionId: number;
  userId: number;
  transactionId: number;
  paymentId: number;
  type: TransactionType;
  amount: Decimal;
  billingCycle?: "MONTHLY" | "YEARLY";
  newPlanId?: number;
}

type TxClient = Prisma.TransactionClient;

/**
 * Finalizes a subscription billing event by activating or updating a subscription
 * after payment confirmation.
 *
 * This function is used for:
 * - Manual payment overrides (PENDING payment + PENDING transaction)
 * - Subscription renewals
 * - Subscription upgrades
 *
 * It performs the following atomically:
 * - Validates user, subscription, payment, and transaction ownership
 * - Calculates and applies subscription expiry and plan changes
 * - Expires any other ACTIVE subscriptions for the user
 * - Marks the payment and transaction as SUCCESS
 * - Activates the subscription
 * - Creates a payment notification
 * - Advances user onboarding state when applicable
 *
 * This function is idempotent and safe to call multiple times.
 */
const finalizeSubscriptionPaymentInternal = async (
  tx: TxClient,
  input: FinalizeSubscriptionPaymentInput,
) => {
  const {
    subscriptionId,
    userId,
    transactionId,
    paymentId,
    type,
    amount,
    billingCycle,
    newPlanId,
  } = input;

  // 1. Fetch user
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // 2. Fetch subscriptions
  const subscription = await tx.subscription.findUnique({
    where: { id: subscriptionId, userId },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  const payment = await tx.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error("Payment not found");

  const transaction = await tx.transaction.findUnique({
    where: { id: transactionId },
  });
  if (!transaction) throw new Error("Transaction not found");
  if (payment.status === "SUCCESS" && transaction.status === "SUCCESS") {
    // Already finalized; idempotent exit
    return;
  }

  // 3. Idempotent: do nothing if already active
  if (subscription.status === "ACTIVE") return;

  const isUpgrade = type === "SUBSCRIPTION_UPGRADE";
  const isRenewal =
    type === "SUBSCRIPTION_RENEWAL" || type === "SUBSCRIPTION_PAYMENT";

  let expiresAt = subscription.expiresAt;
  let planId = subscription.planId;
  let finalBillingCycle = subscription.billingCycle;

  // 4. Handle upgrade
  if (isUpgrade) {
    const activeSubscription = await tx.subscription.findFirst({
      where: { status: "ACTIVE", userId },
      include: { plan: true },
    });

    if (!newPlanId || !billingCycle || !activeSubscription)
      throw new Error("Upgrade details missing");

    planId = newPlanId;
    finalBillingCycle = billingCycle;

    expiresAt = calculateExpiryForUpgrade({
      currentSubscription: activeSubscription,
      newBillingCycle: billingCycle,
    });
  }

  // 5. Handle renewal
  if (isRenewal) {
    const baseDate =
      subscription.expiresAt && subscription.expiresAt > new Date()
        ? subscription.expiresAt
        : new Date();

    expiresAt =
      finalBillingCycle === "YEARLY"
        ? new Date(new Date(baseDate).setFullYear(baseDate.getFullYear() + 1))
        : new Date(new Date(baseDate).setMonth(baseDate.getMonth() + 1));
  }

  // 6. Expire any existing ACTIVE subscriptions to avoid unique constraint violation
  // This must happen for both upgrades and renewals before activating the subscription
  await tx.subscription.updateMany({
    where: {
      userId: user.id,
      status: "ACTIVE",
      NOT: { id: subscription.id },
    },
    data: { status: "EXPIRED" },
  });

  // 7. Activate this subscription
  const updatedSubscription = await tx.subscription.update({
    where: { id: subscription.id },
    data: {
      status: "ACTIVE",
      planId,
      billingCycle: finalBillingCycle,
      expiresAt,
      pendingPlanId: null,
      startedAt: isRenewal ? new Date() : subscription.startedAt,
    },
    include: { plan: true },
  });

  // 8. Update transaction & payment status
  await tx.transaction.update({
    where: { id: transactionId },
    data: { status: "SUCCESS" },
  });

  await tx.payment.update({
    where: { id: paymentId },
    data: { status: "SUCCESS" },
  });

  // 9. Create notification
  const notification = buildNotification({
    category: "PAYMENT",
    type,
    planName: updatedSubscription.plan.name,
    expiresAt,
    status: "success",
    meta: {
      amount,
      currency: "USD",
      previousPlanId: subscription.planId,
      newPlanId: planId,
    },
  });

  await tx.notification.create({
    data: {
      category: notification.category,
      title: notification.title,
      message: notification.message,
      userId: user.id,
      meta: notification.meta,
    },
  });

  // 10. Advance onboarding if necessary
  if (user.onboardingStep !== "COMPLETE") {
    await tx.user.update({
      where: { id: user.id },
      data: { onboardingStep: "STORE_DETAILS" },
    });
  }

  // 11. Send subscription activation emails in production
  if (env.NODE_ENV === "production") {
    // Send appropriate email based on transaction type
    if (isUpgrade) {
      const previousPlan = await tx.subscriptionPlan.findUnique({
        where: { id: subscription.planId },
      });

      await sendUserEmail(user.email, "SUBSCRIPTION_UPGRADE", {
        firstName: user.fullName?.split(" ")[0] || "User",
        oldPlanName: previousPlan?.name || "Previous Plan",
        newPlanName: updatedSubscription.plan.name,
        newPlanPrice: amount.toFixed(2),
        currency: "USD",
        expiresAt:
          expiresAt?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) || "N/A",
      });
    } else if (isRenewal && type === "SUBSCRIPTION_RENEWAL") {
      await sendUserEmail(user.email, "SUBSCRIPTION_RENEWED", {
        firstName: user.fullName?.split(" ")[0] || "User",
        planName: updatedSubscription.plan.name,
        planPrice: amount.toFixed(2),
        currency: "USD",
        renewedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        expiresAt:
          expiresAt?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) || "N/A",
      });
    } else {
      // New subscription activated (manual payment approved)
      await sendUserEmail(user.email, "SUBSCRIPTION_ACTIVATED", {
        firstName: user.fullName?.split(" ")[0] || "User",
        planName: updatedSubscription.plan.name,
        expiresAt:
          expiresAt?.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }) || "N/A",
      });

      // Send admin notification for new subscription
      await sendEmailToAdmins("ADMIN_NEW_SUBSCRIPTION", {
        storeName: "N/A",
        storeId: "N/A",
        planName: updatedSubscription.plan.name,
        amount: amount.toFixed(2),
        currency: "USD",
        ownerName: user.fullName || "Unknown",
        ownerEmail: user.email,
        subscribedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  }
};

export const finalizeSubscriptionPayment = async (
  input: FinalizeSubscriptionPaymentInput,
  tx?: TxClient,
) => {
  if (tx) {
    return finalizeSubscriptionPaymentInternal(tx, input);
  }

  return prisma.$transaction(async (trx) => {
    return finalizeSubscriptionPaymentInternal(trx, input);
  });
};
