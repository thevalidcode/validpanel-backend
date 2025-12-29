import dotenv from 'dotenv';
import {
  PaymentGatewayStatus,
  PaymentMethod,
} from "../../prisma/generated";
import { prisma } from "../config/db.config";

dotenv.config();
export const mockPaymentGateways = [
  {
    id: 1,
    uid: "stripe-001",
    platform: "FLUTTERWAVE" as PaymentMethod,
    name: "Stripe",
    description: "Credit/Debit Card, Apple Pay, Google Pay",
    signature: null,
    encryptedSecretKey: null,
    iv: null,
    image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg",
    status: "ACTIVE" as PaymentGatewayStatus,
    createdAt: new Date(),
    position: 1,
    min: "1.00",
    max: "10000.00",
  },
  {
    id: 2,
    uid: "paystack-001",
    platform: "PAYSTACK" as PaymentMethod,
    name: "Paystack",
    description: "Bank Transfer, Card, Mobile Money",
    signature: null,
    encryptedSecretKey: null,
    iv: null,
    image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paystack.svg",
    status: "ACTIVE" as PaymentGatewayStatus,
    createdAt: new Date(),
    position: 2,
    min: "1.00",
    max: "5000.00",
  },
  {
    id: 3,
    uid: "manual-001",
    platform: "MANUAL" as PaymentMethod,
    name: "Manual Payment",
    description: "Pay via bank transfer or other manual methods.",
    content:
      "Your subscription will be activated after payment verification by our team (usually within 24 hours).",
    signature: null,
    encryptedSecretKey: null,
    iv: null,
    image: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/cashapp.svg",
    status: "ACTIVE" as PaymentGatewayStatus,
    createdAt: new Date(),
    position: 3,
    min: "0.00",
    max: "999999.00",
  },
];

async function main() {
  for (const gateway of mockPaymentGateways) {
    await prisma.paymentGateway.upsert({
      where: { uid: gateway.uid },
      update: { ...gateway },
      create: { ...gateway },
    });
    console.log(`Gateway ${gateway.name} added/updated`);
  }
  console.log("All gateways seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
