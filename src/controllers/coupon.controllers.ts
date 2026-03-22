import type { Request, Response } from "express";
import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../config/db.config";
import { AdminAuthSchema } from "../schemas/admin.schema";
import {
  CouponApplySchema,
  CouponCreateSchema,
  CouponPublicContextQuerySchema,
  CouponPublicListQuerySchema,
  CouponUidSchema,
  CouponUpdateSchema,
} from "../schemas/coupon.schema";

const normalizeCouponContext = (value: string): string => {
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
  if (normalized === "HOMEPAGE") return "HOME_PAGE";
  if (normalized === "PRICINGPAGE") return "PRICING_PAGE";
  return normalized;
};

const getPublicCouponWhere = (input: {
  context?: string;
  currency?: string;
  appliesTo?: "NEW" | "RENEWAL" | "UPGRADE";
  autoApply?: boolean;
  code?: string;
}) => {
  const now = new Date();
  const where: any = {
    isPublic: true,
    isActive: true,
    AND: [
      {
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
    ],
  };

  if (input.context) {
    where.contexts = { has: normalizeCouponContext(input.context) };
  }

  if (input.currency) {
    where.OR = [{ currency: null }, { currency: input.currency.toUpperCase() }];
  }

  if (input.appliesTo) {
    where.appliesTo = { has: input.appliesTo };
  }

  if (typeof input.autoApply === "boolean") {
    where.autoApply = input.autoApply;
  }

  if (input.code) {
    where.code = { contains: input.code, mode: "insensitive" };
  }

  return where;
};

export const listCoupons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const coupons = await prisma.coupon.findMany({
      include: { rules: true },
      orderBy: { id: "desc" },
    });
    res.status(200).json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCouponByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = CouponUidSchema.safeParse(req.params);

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

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { uid: paramsParsed.data.uid },
      include: { rules: true },
    });

    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    res.status(200).json(coupon);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = CouponCreateSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const body = bodyParsed.data;

  if (body.type === "FIXED" && !body.currency) {
    res.status(400).json({ error: "Fixed coupons require a currency" });
    return;
  }

  try {
    const created = await prisma.coupon.create({
      data: {
        code: body.code,
        type: body.type,
        value: new Decimal(body.value),
        currency: body.currency,
        maxUses: body.maxUses,
        perUserLimit: body.perUserLimit,
        isActive: body.isActive ?? true,
        startsAt: body.startsAt,
        expiresAt: body.expiresAt,
        minAmount: body.minAmount,
        firstTimeOnly: body.firstTimeOnly ?? false,
        appliesTo: body.appliesTo ?? ["NEW"],
        contexts: body.contexts?.map(normalizeCouponContext) ?? [],
        isPublic: body.isPublic ?? false,
        priority: body.priority ?? 0,
        autoApply: body.autoApply ?? false,
        highlightText: body.highlightText,
        rules: body.rules?.length
          ? {
              create: body.rules.map((rule) => ({
                planId: rule.planId,
                interval: rule.interval,
                currency: rule.currency,
                region: rule.region,
              })),
            }
          : undefined,
      },
      include: { rules: true },
    });

    res
      .status(201)
      .json({ success: "Coupon created successfully.", coupon: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = CouponUidSchema.safeParse(req.params);
  const bodyParsed = CouponUpdateSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const data: any = { ...bodyParsed.data };
  if (bodyParsed.data.value) {
    data.value = new Decimal(bodyParsed.data.value);
  }
  if (bodyParsed.data.contexts) {
    data.contexts = bodyParsed.data.contexts.map(normalizeCouponContext);
  }
  if (bodyParsed.data.appliesTo) {
    data.appliesTo = bodyParsed.data.appliesTo;
  }
  delete data.rules;

  const updated = await prisma.coupon.update({
    where: { uid: paramsParsed.data.uid },
    data,
    include: { rules: true },
  });

  if (bodyParsed.data.rules) {
    await prisma.couponRule.deleteMany({ where: { couponId: updated.id } });
    if (bodyParsed.data.rules.length) {
      await prisma.couponRule.createMany({
        data: bodyParsed.data.rules.map((rule) => ({
          couponId: updated.id,
          planId: rule.planId ?? null,
          interval: rule.interval ?? null,
          currency: rule.currency ?? null,
          region: rule.region ?? null,
        })),
      });
    }
  }

  const refreshed = await prisma.coupon.findUnique({
    where: { uid: paramsParsed.data.uid },
    include: { rules: true },
  });

  res
    .status(200)
    .json({ success: "Coupon updated successfully.", coupon: refreshed });
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = CouponUidSchema.safeParse(req.params);

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

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { uid: paramsParsed.data.uid },
      select: { id: true },
    });

    if (!coupon) {
      res.status(404).json({ error: "Coupon not found" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { couponId: coupon.id },
        data: { couponId: null },
      });

      await tx.subscription.updateMany({
        where: { couponId: coupon.id },
        data: { couponId: null },
      });

      await tx.couponRedemption.deleteMany({
        where: { couponId: coupon.id },
      });

      await tx.couponRule.deleteMany({
        where: { couponId: coupon.id },
      });

      await tx.coupon.delete({
        where: { id: coupon.id },
      });
    });

    res.status(200).json({ success: "Coupon deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const validateCoupon = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = CouponApplySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { code, planId, appliesTo, billingCycle, currency, region } =
    parsed.data;
  const normalizedRegion = region?.toUpperCase();
  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: { rules: true },
  });

  if (!coupon || !coupon.isActive) {
    res.status(404).json({ error: "Coupon not found or inactive" });
    return;
  }

  const now = new Date();
  if (
    (coupon.startsAt && coupon.startsAt > now) ||
    (coupon.expiresAt && coupon.expiresAt < now)
  ) {
    res.status(400).json({ error: "Coupon is outside active date range" });
    return;
  }

  if (coupon.appliesTo.length && !coupon.appliesTo.includes(appliesTo)) {
    res.status(400).json({
      error: `Coupon does not apply to ${appliesTo.toLowerCase()} flow`,
    });
    return;
  }

  const matchingRule = coupon.rules.length
    ? coupon.rules.some(
        (rule) =>
          (!rule.planId || rule.planId === planId) &&
          (!rule.interval || rule.interval === billingCycle) &&
          (!rule.currency || rule.currency === currency) &&
          (!rule.region ||
            (normalizedRegion &&
              rule.region.toUpperCase() === normalizedRegion)),
      )
    : true;

  if (!matchingRule) {
    res.status(400).json({ error: "Coupon does not match this purchase" });
    return;
  }

  res.status(200).json({ success: true, coupon });
};

export const listPublicCoupons = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryParsed = CouponPublicListQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  try {
    const coupons = await prisma.coupon.findMany({
      where: getPublicCouponWhere(queryParsed.data),
      include: { rules: true },
      orderBy: [{ priority: "desc" }, { id: "desc" }],
    });

    res.status(200).json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listPublicCouponsByContext = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const queryParsed = CouponPublicContextQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  try {
    const coupons = await prisma.coupon.findMany({
      where: getPublicCouponWhere({ context: queryParsed.data.context }),
      include: { rules: true },
      orderBy: [{ priority: "desc" }, { id: "desc" }],
    });

    res.status(200).json(coupons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
