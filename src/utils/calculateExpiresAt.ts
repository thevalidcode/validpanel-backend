import { BillingInterval, Subscription } from "../../prisma/generated";

export const calculateExpiryForUpgrade = ({
  currentSubscription,
  newBillingCycle,
}: {
  currentSubscription: Subscription;
  newBillingCycle: BillingInterval;
}) => {
  const now = new Date();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  if (!currentSubscription.expiresAt) {
    throw new Error("Current subscription has no expiry date");
  }

  const remainingDays = Math.max(
    Math.ceil(
      (currentSubscription.expiresAt.getTime() - now.getTime()) / MS_PER_DAY
    ),
    0
  );

  // Same cycle
  if (currentSubscription.billingCycle === newBillingCycle) {
    return currentSubscription.expiresAt;
  }

  // Monthly → Yearly (credit remaining time)
  if (
    currentSubscription.billingCycle === "MONTHLY" &&
    newBillingCycle === "YEARLY"
  ) {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    expiry.setDate(expiry.getDate() + remainingDays);
    return expiry;
  }

  // Yearly → Monthly should never happen immediately
  return currentSubscription.expiresAt;
};
