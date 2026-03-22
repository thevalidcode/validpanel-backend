/**
 * PRICING RESOLUTION SERVICE
 *
 * Responsible for resolving the correct PlanPrice given:
 * - planId
 * - billingInterval (MONTHLY | YEARLY)
 * - currency (USD | NGN | EUR, etc.)
 *
 * This is the SINGLE SOURCE OF TRUTH for price lookups
 */

import { prisma } from "../../config/db.config";
import { BillingInterval } from "../../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";
import convertCurrency from "../../utils/ConvertCurrency";

export interface ResolvePriceInput {
  planId: number;
  interval: BillingInterval;
  currency: string;
}

export interface ResolvedPrice {
  id: number;
  planId: number;
  interval: BillingInterval;
  price: Decimal;
  tax: number | null;
  amountInMinor: number;
  currency: string;
  externalId: string | null;
  isActive: boolean;
  isDefault: boolean;
}

/**
 * Resolve price for a subscription request
 *
 * Returns the EXACT price for the given interval and currency
 * Throws error if:
 * - Plan not found
 * - Price not found for interval+currency combo
 * - Price is inactive
 */
export const resolvePriceForSubscription = async (
  input: ResolvePriceInput,
): Promise<ResolvedPrice> => {
  const { planId, interval, currency } = input;
  const requestedCurrency = currency.toUpperCase();

  // Validate plan exists
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
    select: { id: true, status: true },
  });

  if (!plan) {
    throw new Error(`Plan with ID ${planId} not found`);
  }

  if (plan.status === "INACTIVE" || plan.status === "DRAFT") {
    throw new Error(`Plan with ID ${planId} is not available for purchase`);
  }

  // Find exact price match for interval and currency
  const price = await prisma.planPrice.findFirst({
    where: {
      planId,
      interval,
      currency: requestedCurrency,
      isActive: true, // Must be active
    },
  });

  if (price) {
    return price;
  }

  // Fallback: use active default price for the same interval and convert.
  const defaultPrice = await prisma.planPrice.findFirst({
    where: {
      planId,
      interval,
      isActive: true,
      isDefault: true,
    },
    orderBy: { id: "asc" },
  });

  if (!defaultPrice) {
    throw new Error(
      `No active price found for plan ${planId} with interval ${interval} and currency ${requestedCurrency}. ` +
        `No active default price exists for fallback conversion.`,
    );
  }

  const convertedAmount = await convertCurrency(
    defaultPrice.price,
    defaultPrice.currency,
    requestedCurrency,
  );

  if (
    !Number.isFinite(convertedAmount) ||
    (defaultPrice.price.gt(0) && convertedAmount <= 0)
  ) {
    throw new Error(
      `Price conversion failed from ${defaultPrice.currency} to ${requestedCurrency} for plan ${planId}.`,
    );
  }

  return {
    ...defaultPrice,
    price: new Decimal(convertedAmount.toFixed(2)),
    currency: requestedCurrency,
    amountInMinor: Math.round(convertedAmount * 100),
    // Converted price is a computed fallback, not a stored default for target currency.
    isDefault: false,
    externalId: null,
  };
};

/**
 * Try to resolve with fallback logic
 *
 * If exact currency+interval not found:
 * 1. Try default currency (USD)
 * 2. Return error if both fail
 */
export const resolvePriceWithFallback = async (
  input: ResolvePriceInput,
  fallbackCurrency: string = "USD",
): Promise<ResolvedPrice> => {
  try {
    return await resolvePriceForSubscription(input);
  } catch (error) {
    // Try fallback currency
    if (input.currency !== fallbackCurrency) {
      try {
        return await resolvePriceForSubscription({
          ...input,
          currency: fallbackCurrency,
        });
      } catch (fallbackError) {
        // Both failed
        throw new Error(
          `Price resolution failed for plan ${input.planId}: ` +
            `No price available for ${input.currency} (tried fallback ${fallbackCurrency})`,
        );
      }
    }

    throw error;
  }
};

/**
 * Get all available prices for a plan
 * Useful for displaying pricing options to users
 */
export const getAvailablePricesForPlan = async (planId: number) => {
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error(`Plan with ID ${planId} not found`);
  }

  const prices = await prisma.planPrice.findMany({
    where: {
      planId,
      isActive: true,
    },
    orderBy: [{ currency: "asc" }, { interval: "asc" }],
  });

  return prices;
};

/**
 * Validate price is still active and available
 * Used before initiating payment
 */
export const validatePriceAvailability = async (
  priceId: number,
): Promise<ResolvedPrice> => {
  const price = await prisma.planPrice.findUnique({
    where: { id: priceId },
  });

  if (!price) {
    throw new Error(`Price with ID ${priceId} not found`);
  }

  if (!price.isActive) {
    throw new Error(
      `Price with ID ${priceId} is no longer available for purchase`,
    );
  }

  return price;
};

/**
 * Get default price for a plan (for UI display)
 * Prefers USD if available, otherwise returns cheapest option
 */
export const getDefaultPriceForPlan = async (
  planId: number,
): Promise<ResolvedPrice> => {
  // Try to find default price first
  const defaultPrice = await prisma.planPrice.findFirst({
    where: {
      planId,
      isActive: true,
      isDefault: true,
    },
  });

  if (defaultPrice) {
    return defaultPrice;
  }

  // Fallback: Get USD MONTHLY if available
  const usdMonthly = await prisma.planPrice.findFirst({
    where: {
      planId,
      currency: "USD",
      interval: "MONTHLY",
      isActive: true,
    },
  });

  if (usdMonthly) {
    return usdMonthly;
  }

  // Last resort: Get any active price
  const anyPrice = await prisma.planPrice.findFirst({
    where: {
      planId,
      isActive: true,
    },
    orderBy: { createdAt: "asc" },
  });

  if (!anyPrice) {
    throw new Error(`No active prices found for plan ${planId}`);
  }

  return anyPrice;
};
