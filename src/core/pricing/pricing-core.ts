import { Decimal } from "@prisma/client/runtime/client";
import type { BillingInterval, DiscountType } from "../../../prisma/generated";
import type { PlanPrice } from "../../../prisma/generated";

export type CurrencyCode = string;

export interface ResolvedPlanPrice {
  price: PlanPrice | null;
  amount: Decimal;
  currency: CurrencyCode;
  taxRate: Decimal;
}

export interface CouponPricingInput {
  type: DiscountType;
  value: string | number | Decimal;
  currency?: CurrencyCode | null;
}

export interface PricingComputationInput {
  subtotal: string | number | Decimal;
  taxRate: string | number | Decimal | null | undefined;
  couponApplied?: boolean;
  couponDiscountAmount?: string | number | Decimal;
  couponCurrency?: CurrencyCode;
  subtotalCurrency: CurrencyCode;
  coupon?: CouponPricingInput;
  convertAmount?: (
    source: CurrencyCode,
    target: CurrencyCode,
    amount: string,
  ) => string;
}

export interface PricingComputationResult {
  subtotalBeforeDiscount: string;
  couponDiscount: string;
  subtotalAfterDiscount: string;
  taxAmount: string;
  total: string;
}

const toDecimal = (
  value: string | number | Decimal | null | undefined,
): Decimal => {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }
  return new Decimal(value);
};

const clampBetweenZeroAndSubtotal = (
  subtotal: Decimal,
  value: Decimal,
): Decimal => {
  if (value.lt(0)) return new Decimal(0);
  if (value.gt(subtotal)) return subtotal;
  return value;
};

export function resolvePlanPrice(
  prices: PlanPrice[],
  interval: BillingInterval,
  preferredCurrency?: CurrencyCode,
): ResolvedPlanPrice {
  const targetCurrency = (preferredCurrency || "USD").toUpperCase();

  const directPrice = prices.find(
    (p) =>
      p.interval === interval &&
      p.currency.toUpperCase() === targetCurrency &&
      p.isActive,
  );

  const fallbackPrice =
    prices.find((p) => p.interval === interval && p.isDefault && p.isActive) ||
    prices.find((p) => p.interval === interval && p.isActive);

  const selectedPrice = directPrice || fallbackPrice || null;
  const amount = toDecimal(selectedPrice?.price as unknown as Decimal);
  const currency = (selectedPrice?.currency || "USD").toUpperCase();
  const taxRate = toDecimal(selectedPrice?.tax);

  return {
    price: selectedPrice,
    amount,
    currency,
    taxRate,
  };
}

export function computeCouponDiscountAmount(
  subtotal: string | number | Decimal,
  subtotalCurrency: CurrencyCode,
  coupon?: CouponPricingInput,
  couponApplied?: boolean,
  couponDiscountAmount?: string | number | Decimal,
  couponCurrency?: CurrencyCode,
  convertAmount?: (
    source: CurrencyCode,
    target: CurrencyCode,
    amount: string,
  ) => string,
): Decimal {
  const subtotalDecimal = toDecimal(subtotal);

  if (!couponApplied || subtotalDecimal.lte(0)) {
    return new Decimal(0);
  }

  if (couponDiscountAmount !== undefined && couponDiscountAmount !== null) {
    let normalized = toDecimal(couponDiscountAmount);
    const fromCurrency = couponCurrency?.toUpperCase();

    if (
      fromCurrency &&
      fromCurrency !== subtotalCurrency.toUpperCase() &&
      convertAmount
    ) {
      normalized = toDecimal(
        convertAmount(
          fromCurrency,
          subtotalCurrency.toUpperCase(),
          normalized.toFixed(2),
        ),
      );
    }

    return clampBetweenZeroAndSubtotal(subtotalDecimal, normalized);
  }

  if (!coupon) {
    return new Decimal(0);
  }

  if (coupon.type === "PERCENTAGE") {
    const percent = toDecimal(coupon.value);
    const discount = subtotalDecimal.mul(percent.div(100));
    return clampBetweenZeroAndSubtotal(subtotalDecimal, discount);
  }

  let fixedValue = toDecimal(coupon.value);
  const fixedCurrency = coupon.currency?.toUpperCase();

  if (
    fixedCurrency &&
    fixedCurrency !== subtotalCurrency.toUpperCase() &&
    convertAmount
  ) {
    fixedValue = toDecimal(
      convertAmount(
        fixedCurrency,
        subtotalCurrency.toUpperCase(),
        fixedValue.toFixed(2),
      ),
    );
  }

  return clampBetweenZeroAndSubtotal(subtotalDecimal, fixedValue);
}

export function computePricingBreakdown({
  subtotal,
  taxRate,
  couponApplied,
  couponDiscountAmount,
  couponCurrency,
  subtotalCurrency,
  coupon,
  convertAmount,
}: PricingComputationInput): PricingComputationResult {
  const subtotalBeforeDiscount = toDecimal(subtotal);

  const couponDiscount = computeCouponDiscountAmount(
    subtotalBeforeDiscount,
    subtotalCurrency,
    coupon,
    couponApplied,
    couponDiscountAmount,
    couponCurrency,
    convertAmount,
  );

  const subtotalAfterDiscount = subtotalBeforeDiscount
    .minus(couponDiscount)
    .lt(0)
    ? new Decimal(0)
    : subtotalBeforeDiscount.minus(couponDiscount);

  const taxRateDecimal = toDecimal(taxRate);
  const taxAmount = subtotalAfterDiscount.mul(taxRateDecimal.div(100));
  const total = subtotalAfterDiscount.plus(taxAmount);

  return {
    subtotalBeforeDiscount: subtotalBeforeDiscount.toFixed(2),
    couponDiscount: couponDiscount.toFixed(2),
    subtotalAfterDiscount: subtotalAfterDiscount.toFixed(2),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
  };
}

export function computeUpgradeDueToday(
  currentSubtotal: string | number | Decimal | null | undefined,
  nextSubtotal: string | number | Decimal,
): string {
  const next = toDecimal(nextSubtotal);
  const current = toDecimal(currentSubtotal);

  if (next.lte(current)) {
    return "0.00";
  }

  return next.minus(current).toFixed(2);
}
