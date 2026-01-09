import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  SubscriptionPlanCreateRequestSchema,
  SubscriptionPlanUidSchema,
  SubscriptionPlanUpdateRequestSchema,
} from "../schemas/subscriptionPlan.schema";
import { AdminAuthSchema } from "../schemas/admin.schema";
import { Decimal } from "@prisma/client/runtime/client";

export const getSubscriptionPlansForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { price: "asc" },
    });

    res.status(200).json(subscriptionPlans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionPlanByUidForUser = async (
  req: Request,
  res: Response
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
    const idAsNumber = parseInt(uid, 10);
    const where = isNaN(idAsNumber)
      ? { uid, status: "ACTIVE" as const }
      : { id: idAsNumber, status: "ACTIVE" as const };

    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where,
    });

    res.status(200).json(subscriptionPlan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionPlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
      orderBy: { id: "desc" },
    });

    res.status(200).json(subscriptionPlans);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionPlanByUid = async (
  req: Request,
  res: Response
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
    });

    res.status(200).json(subscriptionPlan);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addSubscriptionPlan = async (
  req: Request,
  res: Response
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
    await prisma.subscriptionPlan.create({
      data: {
        name: bodyParsed.data.name,
        price: new Decimal(bodyParsed.data.price),
        currency: bodyParsed.data.currency,
        interval: bodyParsed.data.interval,
        description: bodyParsed.data.description,
        tax: bodyParsed.data.tax,
        discountForAnnually: bodyParsed.data.discountForAnnually,
        gracePeriod: bodyParsed.data.gracePeriod,
        features: bodyParsed.data.features,
      },
    });

    res.status(200).json({
      success: "Subscription Plan created successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSubscriptionPlan = async (
  req: Request,
  res: Response
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
    await prisma.subscriptionPlan.update({
      where: { uid },
      data: {
        ...bodyParsed.data,
      },
    });

    res.status(200).json({
      success: "Subscription Plan updated successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubscriptionPlanByUid = async (
  req: Request,
  res: Response
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
