import { prisma } from "../config/db.config";
import axios from "axios";
import { decryptKey } from "../utils/encrypt";
import { FlutterwaveWebhookData } from "../schemas/webhook.schema";
import convertCurrency from "../utils/ConvertCurrency";
import {
  handleSubscriptionGatewayFailure,
  handleSubscriptionGatewaySuccess,
} from "../services/subscription/payment-webhook-handler";

export const initFlutterwavePayment = async (
  paymentData: any,
  secretKey: { encrypted_key: string; iv: string },
) => {
  const convertedAmount = await convertCurrency(
    paymentData.amount,
    "USD",
    paymentData.currency,
  );

  const response = await axios.post(
    "https://api.flutterwave.com/v3/payments",
    { ...paymentData, amount: convertedAmount },
    {
      headers: {
        Authorization: `Bearer ${decryptKey(
          secretKey.encrypted_key,
          secretKey.iv,
        )}`,
      },
    },
  );
  return { url: response.data.data.link };
};

export const processSuccess = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  await handleSubscriptionGatewaySuccess({
    customerEmail: customer.email,
    amount: data.data.amount,
    amountIsMinor: false,
    currency: data.data.currency,
    meta: data.meta_data,
    paymentMethod: "FLUTTERWAVE",
    transactionReference:
      data.data.tx_ref || String(data.meta_data.transactionId),
  });
};

const processFailure = async (
  data: FlutterwaveWebhookData,
  customer: FlutterwaveWebhookData["data"]["customer"],
) => {
  await handleSubscriptionGatewayFailure({
    customerEmail: customer.email,
    amount: data.data.amount,
    amountIsMinor: false,
    currency: data.data.currency,
    meta: data.meta_data,
    paymentStatus: data.data.status,
  });
};

export default { processSuccess, processFailure };
