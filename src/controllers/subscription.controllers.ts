import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { AuthSchema } from "../schemas/user.schema";
import {
  SubscriptionUidSchema,
  SubscriptionCreateRequestSchema,
  SubscriptionUpdateRequestSchema,
} from "../schemas/subscription.schema";

export const getSubscriptions = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { id: "desc" },
    });

    res.status(200).json(subscriptions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = SubscriptionUidSchema.safeParse(req.params);

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
    const subscription = await prisma.subscription.findUnique({
      where: { uid },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionsForUser = async (
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
    const subscriptions = await prisma.subscription.findMany({
      where: { status: "ACTIVE", userId: user.id },
      orderBy: { id: "desc" },
    });

    res.status(200).json(subscriptions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getSubscriptionByUidForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = SubscriptionUidSchema.safeParse(req.params);

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
    const subscription = await prisma.subscription.findUnique({
      where: { uid, status: "ACTIVE", userId: user.id },
    });

    res.status(200).json(subscription);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const bodyParsed = SubscriptionCreateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const { planId, userId } = bodyParsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.subscription.create({
        data: {
          status: "PENDING",
          userId,
          planId,
        },
      });
    });

    res.status(200).json({
      success: "Subscription created successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = SubscriptionUpdateRequestSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { uid, status } = parsed.data;

  try {
    await prisma.subscription.update({
      where: { uid },
      data: {
        status,
      },
    });

    res.status(200).json({
      success: "Subscription updated successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
