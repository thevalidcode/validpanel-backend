import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AuthSchema } from "../schemas/user.schema";
import {
  SubscriptionPlanCreateRequestSchema,
  SubscriptionPlanUidSchema,
  SubscriptionPlanUpdateRequestSchema,
} from "../schemas/subscriptionPlan.schema";

export const getSubscriptionPlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

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
  const authParsed = AuthSchema.safeParse(req.auth);
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

export const getSubscriptionPlansForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  const { user } = authParsed.data;

  try {
    const subscriptionPlans = await prisma.subscriptionPlan.findMany({
      where: { status: "ACTIVE" },
      orderBy: { id: "desc" },
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
  const { user } = authParsed.data;

  try {
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { uid, status: "ACTIVE" },
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
    await prisma.$transaction(async (tx) => {
      await tx.subscriptionPlan.create({
        data: {
          ...bodyParsed.data,
        },
      });
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
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = SubscriptionPlanUpdateRequestSchema.safeParse(req.body);

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
    await prisma.subscriptionPlan.update({
      where: { uid },
      data: {
        ...parsed.data,
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
  const authParsed = AuthSchema.safeParse(req.auth);
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
