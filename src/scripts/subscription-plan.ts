import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionPlanStatus,
} from "../../prisma/generated";
import { prisma } from "../config/db.config";

const mockPlans = [
  {
    id: 1,
    uid: "free-plan-001",
    name: "Free Plan",
    price: "0",
    gracePeriod: 8,
    currency: "USD",
    description: "ideal for testing or new sellers",
    status: "ACTIVE" as SubscriptionPlanStatus,
    tax: 10,
    discountForAnnually: 30,
    features: {
      stores: 1,
      products: 10,
    },
    interval: "MONTHLY" as BillingInterval,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    uid: "standard-plan-001",
    name: "Standard Plan",
    price: "20",
    currency: "USD",
    description: "right for small businesses",
    status: "ACTIVE" as SubscriptionPlanStatus,
    tax: 10,
    gracePeriod: 8,
    discountForAnnually: 30,
    features: {
      stores: 5,
      unlimited_products: true,
      custom_domain: true,
      custom_branding: true,
    },
    interval: "MONTHLY" as BillingInterval,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    uid: "pro-plan-001",
    name: "Pro Plan",
    price: "40",
    gracePeriod: 8,
    currency: "USD",
    description: "for full-time digital entrepreneurs",
    status: "ACTIVE" as SubscriptionPlanStatus,
    tax: 10,
    discountForAnnually: 30,
    features: {
      stores: 100,
      unlimited_products: true,
      priority_support: true,
      custom_domain: true,
      store_analytics: true,
      custom_branding: true,
    },
    interval: "MONTHLY" as BillingInterval,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    uid: "business-plan-001",
    name: "Business Plan",
    price: "80",
    gracePeriod: 8,
    currency: "USD",
    description: "for growing enterprises",
    status: "ACTIVE" as SubscriptionPlanStatus,
    tax: 10,
    discountForAnnually: 30,
    features: {
      stores: 1000,
      unlimited_products: true,
      priority_support: true,
      store_analytics: true,
      custom_domain: true,
      custom_branding: true,
      api_access: true,
    },
    interval: "MONTHLY" as BillingInterval,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    uid: "empire-plan-001",
    name: "Empire Plan",
    price: "150",
    gracePeriod: 8,
    currency: "USD",
    description: "for large scale operations",
    status: "ACTIVE" as SubscriptionPlanStatus,
    tax: 10,
    discountForAnnually: 30,
    features: {
      stores: 10000,
      unlimited_products: true,
      custom_domain: true,
      priority_support: true,
      store_analytics: true,
      custom_branding: true,
      api_access: true,
    },
    interval: "MONTHLY" as BillingInterval,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function main() {
  for (const plan of mockPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { uid: plan.uid },
      update: { ...plan },
      create: { ...plan },
    });
    console.log(`Plan ${plan.name} added/updated`);
  }
  console.log("All plans seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
