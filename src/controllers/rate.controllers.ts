import { Request, Response } from "express";
import { prisma } from "../config/db.config";

export const getCurrentRates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exchangeRate = await prisma.exchangeRate.findFirst({
      select: {
        rates: true,
      },
    });

    res.status(200).json({ rates: exchangeRate?.rates });
  } catch (error: any) {
    console.error("Error fetching rates:", error);
    res.status(500).json({ error: "Error fetching rates." });
  }
};
