import dotenv from "dotenv";
import {
  BillingInterval,
  DiscountType,
  SubscriptionPlanStatus,
} from "../../prisma/generated";
import { prisma } from "../config/db.config";
import { Decimal } from "@prisma/client/runtime/client";

dotenv.config();

type SeedPlan = {
  uid: string;
  name: string;
  description: string;
  status: SubscriptionPlanStatus;
  gracePeriod: number;
  tax: number;
  prices: {
    usd: {
      monthly: string;
      yearly: string;
      monthlyMinor: number;
      yearlyMinor: number;
    };
    ngn: {
      monthly: string;
      yearly: string;
      monthlyMinor: number;
      yearlyMinor: number;
    };
  };
  features: Record<string, unknown>;
};

const mockPlans = [
  {
    uid: "starter-free-plan",
    name: "Starter",
    description: "For new or testing users",
    status: SubscriptionPlanStatus.ACTIVE,
    gracePeriod: 8,
    tax: 0,
    prices: {
      usd: {
        monthly: "0",
        yearly: "0",
        monthlyMinor: 0,
        yearlyMinor: 0,
      },
      ngn: {
        monthly: "0",
        yearly: "0",
        monthlyMinor: 0,
        yearlyMinor: 0,
      },
    },
    features: {
      stores: 1,
      products: 100,
      analytics: false,
      custom_branding: true,
      priority_support: false,
      store_analytics: false,
      unlimited_products: false,
      hide_platform_banner: false,
      api_access: false,
      custom_domain: false,
      ai_features: false,
      customer_emails: false,
      free_ssl: true,
      available_templates: 1,
      custom_templates: false,
      payment_gateways: 2,
      default_template: true,
      staff_accounts: 0,
      social_store_order_sync: false,
      social_store_service_sync: false,
      store_email_notifications: true,
      store_custom_emails: false,
      store_newsletters: false,
    },
  },

  {
    uid: "essentials-plan",
    name: "Essentials",
    description: "For early-stage sellers",
    status: SubscriptionPlanStatus.ACTIVE,
    gracePeriod: 8,
    tax: 10,
    prices: {
      usd: {
        monthly: "20",
        yearly: "200",
        monthlyMinor: 2000,
        yearlyMinor: 20000,
      },
      ngn: {
        monthly: "30000",
        yearly: "300000",
        monthlyMinor: 3000000,
        yearlyMinor: 30000000,
      },
    },
    features: {
      stores: 5,
      products: 200,
      analytics: true,
      custom_branding: true,
      priority_support: false,
      store_analytics: false,
      unlimited_products: false,
      hide_platform_banner: false,
      api_access: false,
      custom_domain: true,
      ai_features: false,
      customer_emails: true,
      free_ssl: true,
      available_templates: 2,
      custom_templates: false,
      payment_gateways: 10,
      default_template: true,
      staff_accounts: 0,
      social_store_order_sync: true,
      social_store_service_sync: true,
      store_email_notifications: true,
      store_custom_emails: false,
      store_newsletters: false,
    },
  },

  {
    uid: "pro-plan",
    name: "Pro",
    description: "For consistent sellers and resellers",
    status: SubscriptionPlanStatus.ACTIVE,
    gracePeriod: 8,
    tax: 10,
    prices: {
      usd: {
        monthly: "40",
        yearly: "400",
        monthlyMinor: 4000,
        yearlyMinor: 40000,
      },
      ngn: {
        monthly: "60000",
        yearly: "600000",
        monthlyMinor: 6000000,
        yearlyMinor: 60000000,
      },
    },
    features: {
      stores: 20,
      products: 500,
      analytics: true,
      custom_branding: true,
      priority_support: false,
      store_analytics: true,
      unlimited_products: false,
      hide_platform_banner: true,
      api_access: false,
      custom_domain: true,
      ai_features: true,
      customer_emails: true,
      free_ssl: true,
      available_templates: 10,
      custom_templates: true,
      payment_gateways: 25,
      default_template: false,
      staff_accounts: 0,
      social_store_order_sync: true,
      social_store_service_sync: true,
      store_email_notifications: true,
      store_custom_emails: true,
      store_newsletters: true,
    },
  },

  {
    uid: "business-plan",
    name: "Business",
    description: "For growing vendors and businesses",
    status: SubscriptionPlanStatus.ACTIVE,
    gracePeriod: 8,
    tax: 10,
    prices: {
      usd: {
        monthly: "80",
        yearly: "800",
        monthlyMinor: 8000,
        yearlyMinor: 80000,
      },
      ngn: {
        monthly: "120000",
        yearly: "1200000",
        monthlyMinor: 12000000,
        yearlyMinor: 120000000,
      },
    },
    features: {
      stores: 100,
      products: 1000,
      analytics: true,
      custom_branding: true,
      priority_support: true,
      store_analytics: true,
      unlimited_products: true,
      hide_platform_banner: true,
      api_access: true,
      custom_domain: true,
      ai_features: true,
      customer_emails: true,
      free_ssl: true,
      available_templates: 20,
      custom_templates: true,
      payment_gateways: 50,
      staff_accounts: 5,
      social_store_order_sync: true,
      social_store_service_sync: true,
      store_email_notifications: true,
      store_custom_emails: true,
      store_newsletters: true,
    },
  },

  {
    uid: "empire-plan",
    name: "Empire",
    description: "For high-volume sellers and teams",
    status: SubscriptionPlanStatus.ACTIVE,
    gracePeriod: 8,
    tax: 10,
    prices: {
      usd: {
        monthly: "150",
        yearly: "1500",
        monthlyMinor: 15000,
        yearlyMinor: 150000,
      },
      ngn: {
        monthly: "225000",
        yearly: "2250000",
        monthlyMinor: 22500000,
        yearlyMinor: 225000000,
      },
    },
    features: {
      stores: 999999,
      products: null,
      analytics: true,
      custom_branding: true,
      priority_support: true,
      store_analytics: true,
      unlimited_products: true,
      hide_platform_banner: true,
      api_access: true,
      custom_domain: true,
      ai_features: true,
      customer_emails: true,
      free_ssl: true,
      available_templates: 999,
      custom_templates: true,
      payment_gateways: 100,
      staff_accounts: 10,
      social_store_order_sync: true,
      social_store_service_sync: true,
      store_email_notifications: true,
      store_custom_emails: true,
      store_newsletters: true,
    },
  },
] as const satisfies SeedPlan[];

async function upsertPlanPrice(
  planId: number,
  interval: BillingInterval,
  currency: "USD" | "NGN",
  price: string,
  amountInMinor: number,
  tax: number,
  isDefault: boolean,
) {
  await prisma.planPrice.upsert({
    where: {
      planId_interval_currency: {
        planId,
        interval,
        currency,
      },
    },
    update: {
      price: new Decimal(price),
      amountInMinor,
      tax,
      isActive: true,
      isDefault,
    },
    create: {
      planId,
      interval,
      price: new Decimal(price),
      amountInMinor,
      currency,
      tax,
      isActive: true,
      isDefault,
    },
  });
}

async function seedCoupons() {
  await prisma.coupon.upsert({
    where: { code: "SAVE10" },
    update: {
      type: DiscountType.PERCENTAGE,
      value: new Decimal("10"),
      currency: null,
      isActive: true,
      appliesTo: ["NEW", "RENEWAL", "UPGRADE"],
      contexts: ["HOME_PAGE", "PRICING_PAGE"],
      isPublic: true,
      priority: 100,
      autoApply: false,
      highlightText: "Save 10% on your next subscription",
      maxUses: 500,
      perUserLimit: 1,
      firstTimeOnly: false,
      minAmount: 0,
    },
    create: {
      code: "SAVE10",
      type: DiscountType.PERCENTAGE,
      value: new Decimal("10"),
      currency: null,
      isActive: true,
      appliesTo: ["NEW", "RENEWAL", "UPGRADE"],
      contexts: ["HOME_PAGE", "PRICING_PAGE"],
      isPublic: true,
      priority: 100,
      autoApply: false,
      highlightText: "Save 10% on your next subscription",
      maxUses: 500,
      perUserLimit: 1,
      firstTimeOnly: false,
      minAmount: 0,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "NGN5000" },
    update: {
      type: DiscountType.FIXED,
      value: new Decimal("5000"),
      currency: "NGN",
      isActive: true,
      appliesTo: ["NEW"],
      contexts: ["PRICING_PAGE"],
      isPublic: true,
      priority: 90,
      autoApply: true,
      highlightText: "Instant NGN 5,000 off",
      maxUses: 200,
      perUserLimit: 1,
      firstTimeOnly: true,
      minAmount: 100000,
    },
    create: {
      code: "NGN5000",
      type: DiscountType.FIXED,
      value: new Decimal("5000"),
      currency: "NGN",
      isActive: true,
      appliesTo: ["NEW"],
      contexts: ["PRICING_PAGE"],
      isPublic: true,
      priority: 90,
      autoApply: true,
      highlightText: "Instant NGN 5,000 off",
      maxUses: 200,
      perUserLimit: 1,
      firstTimeOnly: true,
      minAmount: 100000,
    },
  });
}

async function removeTestingPlanSafely() {
  const starterPlan = await prisma.subscriptionPlan.findUnique({
    where: { uid: "starter-free-plan" },
    select: { id: true },
  });

  const testingPlan = await prisma.subscriptionPlan.findFirst({
    where: {
      OR: [
        { name: "Testing" },
        { uid: "25bef1ab-4214-462f-87ce-e5db1986cbf3" },
      ],
    },
    select: { id: true, uid: true, name: true },
  });

  if (!testingPlan || !starterPlan || testingPlan.id === starterPlan.id) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.subscription.updateMany({
      where: { planId: testingPlan.id },
      data: { planId: starterPlan.id },
    });

    await tx.subscription.updateMany({
      where: { pendingPlanId: testingPlan.id },
      data: { pendingPlanId: starterPlan.id },
    });

    await tx.payment.updateMany({
      where: { planId: testingPlan.id },
      data: { planId: starterPlan.id },
    });

    await tx.couponRule.updateMany({
      where: { planId: testingPlan.id },
      data: { planId: starterPlan.id },
    });

    await tx.planPrice.deleteMany({ where: { planId: testingPlan.id } });
    await tx.subscriptionPlan.delete({ where: { id: testingPlan.id } });
  });

  console.log(`Removed legacy testing plan (${testingPlan.uid})`);
}

async function main(){
  for (const plan of mockPlans) {
    const upserted = await prisma.subscriptionPlan.upsert({
      where: { uid: plan.uid },
      update: {
        name: plan.name,
        description: plan.description,
        status: plan.status,
        gracePeriod: plan.gracePeriod,
        features: plan.features,
      },
      create: {
        uid: plan.uid,
        name: plan.name,
        description: plan.description,
        status: plan.status,
        gracePeriod: plan.gracePeriod,
        features: plan.features,
      },
    });

    await upsertPlanPrice(
      upserted.id,
      BillingInterval.MONTHLY,
      "USD",
      plan.prices.usd.monthly,
      plan.prices.usd.monthlyMinor,
      plan.tax,
      true,
    );

    await upsertPlanPrice(
      upserted.id,
      BillingInterval.YEARLY,
      "USD",
      plan.prices.usd.yearly,
      plan.prices.usd.yearlyMinor,
      plan.tax,
      false,
    );

    await upsertPlanPrice(
      upserted.id,
      BillingInterval.MONTHLY,
      "NGN",
      plan.prices.ngn.monthly,
      plan.prices.ngn.monthlyMinor,
      plan.tax,
      false,
    );

    await upsertPlanPrice(
      upserted.id,
      BillingInterval.YEARLY,
      "NGN",
      plan.prices.ngn.yearly,
      plan.prices.ngn.yearlyMinor,
      plan.tax,
      false,
    );

    console.log(`Plan ${plan.name} added/updated with USD + NGN prices`);
  }

  await seedCoupons();

  console.log("All plans seeded successfully and coupons upserted");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
