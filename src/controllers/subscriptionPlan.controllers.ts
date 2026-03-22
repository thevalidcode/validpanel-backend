import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  SubscriptionPlanCreateRequestSchema,
  SubscriptionPlanUidSchema,
  SubscriptionPlanUpdateRequestSchema,
  PlanPriceCreateRequestSchema,
  PlanPriceParamsSchema,
  PlanPriceUpdateRequestSchema,
} from "../schemas/subscriptionPlan.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { Decimal } from "@prisma/client/runtime/client";

export const getSubscriptionPlansForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
      where: { status: "ACTIVE" },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: [{ interval: "asc" }, { currency: "asc" }],
        },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json(subscriptionPlans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionPlanByUidForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsParsed = SubscriptionPlanUidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({
      error: {
        params: paramsParsed.error.flatten(),
      },
    });
    return;
  }
  const { uid } = paramsParsed.data;

  try {
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { uid },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: [{ interval: "asc" }, { currency: "asc" }],
        },
      },
    });

    if (subscriptionPlan && subscriptionPlan.status !== "ACTIVE") {
      res
        .status(404)
        .json({ error: "Subscription plan not found or inactive" });
      return;
    }

    res.status(200).json(subscriptionPlan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionPlans = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
      include: {
        prices: {
          orderBy: [{ interval: "asc" }, { currency: "asc" }],
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json(subscriptionPlans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionPlanByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = SubscriptionPlanUidSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { uid } = paramsParsed.data;

  try {
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { uid },
      include: {
        prices: {
          orderBy: [{ interval: "asc" }, { currency: "asc" }],
        },
      },
    });

    res.status(200).json(subscriptionPlan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addSubscriptionPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = SubscriptionPlanCreateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  try {
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: bodyParsed.data.name,
        description: bodyParsed.data.description,
        status: bodyParsed.data.status,
        gracePeriod: bodyParsed.data.gracePeriod,
        features: bodyParsed.data.features,
        prices: bodyParsed.data.prices?.length
          ? {
              create: bodyParsed.data.prices.map((p) => ({
                interval: p.interval,
                price: new Decimal(p.price),
                tax: p.tax,
                amountInMinor: p.amountInMinor,
                currency: p.currency,
                externalId: p.externalId,
                isActive: p.isActive,
                isDefault: p.isDefault,
              })),
            }
          : undefined,
      },
      include: {
        prices: true,
      },
    });

    res.status(200).json({
      success: "Subscription Plan created successfully",
      plan,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSubscriptionPlan = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = SubscriptionPlanUpdateRequestSchema.safeParse(req.body);
  const paramsParsed = SubscriptionPlanUidSchema.safeParse(req.params);

  if (!bodyParsed.success || !authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: bodyParsed.error?.flatten(),
        params: paramsParsed.error?.flatten(),
      },
    });
    return;
  }
  const { uid } = paramsParsed.data;
  try {
    const plan = await prisma.subscriptionPlan.update({
      where: { uid },
      data: {
        ...bodyParsed.data,
      },
      include: {
        prices: {
          orderBy: [{ interval: "asc" }, { currency: "asc" }],
        },
      },
    });

    res.status(200).json({
      success: "Subscription Plan updated successfully.",
      plan,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlanPrices = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const planId = Number(req.params.planId);
  if (!Number.isFinite(planId)) {
    res.status(400).json({ error: "Invalid planId" });
    return;
  }

  try {
    const prices = await prisma.planPrice.findMany({
      where: { planId },
      orderBy: [{ interval: "asc" }, { currency: "asc" }],
    });
    res.status(200).json(prices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPlanPrice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = PlanPriceCreateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const planId = Number(req.params.planId);
  if (!Number.isFinite(planId)) {
    res.status(400).json({ error: "Invalid planId" });
    return;
  }

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    const existingPrice = await prisma.planPrice.findFirst({
      where: {
        planId,
        interval: bodyParsed.data.interval,
        currency: bodyParsed.data.currency,
      },
    });

    if (existingPrice) {
      res.status(409).json({
        error: `A price for this plan with the interval ${bodyParsed.data.interval} and currency ${bodyParsed.data.currency} already exists.`,
      });
      return;
    }

    const created = await prisma.$transaction(async (tx) => {
      if (bodyParsed.data.isActive) {
        // Ensure only one active price exists for each plan interval.
        await tx.planPrice.updateMany({
          where: {
            planId,
            interval: bodyParsed.data.interval,
            isActive: true,
          },
          data: {
            isActive: false,
            isDefault: false,
          },
        });
      }

      return tx.planPrice.create({
        data: {
          planId,
          interval: bodyParsed.data.interval,
          price: new Decimal(bodyParsed.data.price),
          tax: bodyParsed.data.tax,
          amountInMinor: bodyParsed.data.amountInMinor,
          currency: bodyParsed.data.currency,
          externalId: bodyParsed.data.externalId,
          isActive: bodyParsed.data.isActive,
          isDefault: bodyParsed.data.isDefault,
        },
      });
    });

    res
      .status(201)
      .json({ success: "Plan price created successfully.", price: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePlanPrice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = PlanPriceUpdateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const priceId = Number(req.params.priceId);
  const planId = Number(req.params.planId);
  if (!Number.isFinite(priceId)) {
    res.status(400).json({ error: "Invalid priceId" });
    return;
  }
  if (!Number.isFinite(planId)) {
    res.status(400).json({ error: "Invalid planId" });
    return;
  }

  try {
    const existingPrice = await prisma.planPrice.findUnique({
      where: { id: priceId },
      select: { id: true, planId: true, interval: true },
    });

    if (!existingPrice || existingPrice.planId !== planId) {
      res.status(404).json({ error: "Plan price not found" });
      return;
    }

    const updateData: any = {
      ...bodyParsed.data,
    };
    if (bodyParsed.data.price) {
      updateData.price = new Decimal(bodyParsed.data.price);
    }

    const price = await prisma.$transaction(async (tx) => {
      if (bodyParsed.data.isActive === true) {
        // Ensure only one active price exists for each plan interval.
        await tx.planPrice.updateMany({
          where: {
            planId,
            interval: existingPrice.interval,
            isActive: true,
            id: { not: priceId },
          },
          data: {
            isActive: false,
            isDefault: false,
          },
        });
      }

      return tx.planPrice.update({
        where: { id: priceId },
        data: updateData,
      });
    });

    res
      .status(200)
      .json({ success: "Plan price updated successfully.", price });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePlanPrice = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = PlanPriceParamsSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success ? paramsParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { planId, priceId } = paramsParsed.data;

  try {
    const existingPrice = await prisma.planPrice.findUnique({
      where: { id: priceId },
      select: { id: true, planId: true },
    });

    if (!existingPrice || existingPrice.planId !== planId) {
      res.status(404).json({ error: "Plan price not found" });
      return;
    }

    await prisma.planPrice.delete({
      where: { id: priceId },
    });

    res.status(200).json({ success: "Plan price deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubscriptionPlanByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const parsed = SubscriptionPlanUidSchema.safeParse(req.params);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }
  const { uid } = parsed.data;
  try {
    await prisma.subscriptionPlan.delete({
      where: { uid },
    });

    res.status(200).json({
      success: "Subscription Plan deleted successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
