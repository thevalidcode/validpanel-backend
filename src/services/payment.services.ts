import flutterwaveProvider from "../providers/flutterwave.providers";
import paystackProvider from "../providers/paystack.providers";
import { prisma } from "../config/db.config";
import { initFlutterwavePayment } from "../providers/flutterwave.providers";
import { initPaystackPayment } from "../providers/paystack.providers";
import type { CreateSubscriptionPaymentInput } from "../schemas/payment.schema";
import { TransactionType, User } from "../../prisma/generated";

export const createSubscriptionPayment = async (
  user: User,
  input: CreateSubscriptionPaymentInput
) => {
  const { platform, currency, subscriptionId, redirect_url } = input;

  const gateway = await prisma.paymentGateway.findFirst({
    where: { platform },
    select: { encryptedSecretKey: true, iv: true, description: true },
  });

  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  if (!gateway) {
    throw new Error("Payment gateway not configured");
  }

  const general = await prisma.general.findFirst({
    select: { title: true, logoUrl: true },
  });

  if (!general) throw new Error("Platform's general settings missing");

  const paymentData = {
    tx_ref: `sub_${subscriptionId}_${Date.now()}`,
    amount: subscription?.plan.price,
    currency,
    redirect_url,
    customer: {
      email: user.email,
    },
    customizations: {
      title: general.title,
      description: gateway.description,
      logo: general.logoUrl,
    },
    meta: {
      subscriptionId,
      userId: user.id,
      type: "SUBSCRIPTION_PAYMENT" as TransactionType,
    },
  };

  if (gateway.encryptedSecretKey === null || gateway.iv === null) {
    throw new Error("Payment gateway not properly configured");
  }

  const parsedSecretKey = {
    encrypted_key: gateway.encryptedSecretKey,
    iv: gateway.iv,
  };

  switch (platform) {
    case "FLUTTERWAVE":
      return initFlutterwavePayment(paymentData, parsedSecretKey);
    case "PAYSTACK":
      return initPaystackPayment(paymentData, parsedSecretKey);
    default:
      throw new Error("Unsupported payment platform");
  }
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
