import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import { StoreIdSchema } from "../schemas/common.schema";

export const getSubscription = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { user } = req.auth!;

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        startedAt: true,
        createdAt: true,
        expiresAt: true,
        billingCycle: true,
        plan: {
          select: {
            id: true,
            description: true,
            discountForAnnually: true,
            tax: true,
            name: true,
            price: true,
            gracePeriod: true,
            interval: true,
            features: true,
          },
        },
      },
    });

    if (!subscription) {
      res.status(404).json({ error: "No subscription not found" });
      return;
    }
    res.status(200).json({ subscription });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch subscription " + err.message });
  }
};

export const getStore = async (req: Request, res: Response): Promise<void> => {
  const queryParsed = StoreIdSchema.safeParse(req.query).data;

  if (!queryParsed) {
    res.status(400).json({ error: "Store ID is required in query" });
    return;
  }

  const storeId = queryParsed.storeId;

  try {
    const store = await prisma.store.findUnique({ where: { storeId } });

    if (!store) {
      res.status(404).json({ error: "Store not found" });
      console.log("first")
      return;
    }

    res.status(200).json({ store });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch store " + err.message });
  }
};
