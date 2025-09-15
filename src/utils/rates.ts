import axios from "axios";
import { prisma } from "../config/db.config";
import { env } from "../config/env.config";

const rateKey = env.RATE_KEY;

async function getCurrentRates() {
  try {
    const response = await axios.get(
      `http://apilayer.net/api/live?access_key=${rateKey}`
    );
    const data = response.data;

    const quotes: Record<string, number> = {};
    for (const [currencyCode, rate] of Object.entries(data.quotes)) {
      const formattedCurrencyCode = currencyCode.substring(3);
      quotes[formattedCurrencyCode] = rate as number;
    }

    quotes["USD"] = 1;
    return quotes;
  } catch (error) {
    return null;
  }
}

const saveRates = async () => {
  const rates = await getCurrentRates();
  if (!rates) return;

  try {
    const existing = await prisma.exchangeRate.findFirst();

    if (existing) {
      await prisma.exchangeRate.update({
        where: { uid: existing.uid },
        data: { rates },
      });
    } else {
      await prisma.exchangeRate.create({
        data: { rates },
      });
    }
  } catch (error: any) {
    console.error("Error saving exchange rates:", error.message || error);
  }
};

export { saveRates, getCurrentRates };
