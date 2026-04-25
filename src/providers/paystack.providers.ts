import { prisma } from "../config/db.config";
import convertCurrency from "../utils/ConvertCurrency";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { PaystackWebhookData } from "../schemas/webhook.schema";
import {
  handleSubscriptionGatewayFailure,
  handleSubscriptionGatewaySuccess,
} from "../services/subscription/payment-webhook-handler";

export const initPaystackPayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string },
) => {
  const convertedNGNAmount = await convertCurrency(
    paymentData.amount,
    "USD",
    "NGN",
  );
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: paymentData.customer.email,
      amount: convertedNGNAmount * 100, // Paystack uses kobo
      currency: "NGN",
      callback_url: paymentData.redirect_url,
      metadata: paymentData.meta,
    },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encrypted_key,
          secretKey.iv,
        )}`,
      },
    },
  );
  return { url: response.data.data.authorization_url };
};

const processSuccess = async (
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  await handleSubscriptionGatewaySuccess({
    customerEmail: customer.email,
    amount: data.amount,
    amountIsMinor: true,
    currency: data.currency,
    meta: data.metadata,
    paymentMethod: "PAYSTACK",
    transactionReference: data.reference || String(data.metadata.transactionId),
  });
};

const processFailure = async (
  data: PaystackWebhookData,
  customer: PaystackWebhookData["customer"],
) => {
  await handleSubscriptionGatewayFailure({
    customerEmail: customer.email,
    amount: data.amount,
    amountIsMinor: true,
    currency: data.currency,
    meta: data.metadata,
    paymentStatus: data.status,
  });
};

export default { processSuccess, processFailure };
