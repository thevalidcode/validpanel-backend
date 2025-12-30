import { prisma } from "../../config/db.config";
import { Decimal } from "@prisma/client/runtime/library";
import { TransactionType } from "../../../prisma/generated";
import { calculateExpiryForUpgrade } from "../../utils/calculateExpiresAt";
import { buildNotification } from "../notification.services";
import { Prisma } from "@prisma/client";

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

const finalizeSubscriptionPaymentInternal = async (
  tx: TxClient,
  input: FinalizeSubscriptionPaymentInput
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

  // 2. Fetch subscription
  const subscription = await tx.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true },
  });
  if (!subscription || subscription.userId !== userId) {
    throw new Error("Subscription not found");
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
    if (!newPlanId || !billingCycle) throw new Error("Upgrade details missing");

    planId = newPlanId;
    finalBillingCycle = billingCycle;

    expiresAt = calculateExpiryForUpgrade({
      currentSubscription: subscription,
      newBillingCycle: billingCycle,
    });
  }

  // 5. Handle renewal
  if (isRenewal) {
    const now = new Date();
    expiresAt =
      finalBillingCycle === "YEARLY"
        ? new Date(now.setFullYear(now.getFullYear() + 1))
        : new Date(now.setMonth(now.getMonth() + 1));
  }

  // 6. Expire any existing ACTIVE subscriptions to avoid unique constraint violation
  await tx.subscription.updateMany({
    where: { userId: user.id, status: "ACTIVE" },
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
  if (user.onboardingStep !== "COMPLETE" && isRenewal) {
    await tx.user.update({
      where: { id: user.id },
      data: { onboardingStep: "STORE_DETAILS" },
    });
  }
};


export const finalizeSubscriptionPayment = async (
  input: FinalizeSubscriptionPaymentInput,
  tx?: TxClient
) => {
  if (tx) {
    return finalizeSubscriptionPaymentInternal(tx, input);
  }

  return prisma.$transaction(async (trx) => {
    return finalizeSubscriptionPaymentInternal(trx, input);
  });
};
