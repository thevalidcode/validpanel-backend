import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db.config";
import { AuthSchema } from "../schemas/user.schema";

/**
 * Middleware to check if user has an active subscription
 * This should be applied to routes that require an active subscription
 */
export const requireActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // If it's an admin request, bypass subscription checks
    if (req.auth?.type === "admin") {
      next();
      return;
    }

    const authParsed = AuthSchema.safeParse(req.auth);

    if (!authParsed.success) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const auth = authParsed.data;

    // Check for active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      res.status(403).json({
        error: "Active subscription required",
        message:
          "You need an active subscription to perform this action. Please renew your subscription to continue.",
      });
      return;
    }

    // Check if subscription has expired
    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
      res.status(403).json({
        error: "Subscription expired",
        message:
          "Your subscription has expired. Please renew to continue using this feature.",
      });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to verify subscription",
      message: err.message,
    });
  }
};

/**
 * Middleware to check if user can create stores based on subscription plan limits
 */
export const checkStoreCreationLimit = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // If it's an admin request, bypass subscription checks
    if (req.auth?.type === "admin") {
      next();
      return;
    }

    const authParsed = AuthSchema.safeParse(req.auth);

    if (!authParsed.success) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const auth = authParsed.data;

    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      res.status(403).json({
        error: "Active subscription required",
        message: "You need an active subscription to create stores.",
      });
      return;
    }

    // Check if subscription has expired
    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
      res.status(403).json({
        error: "Subscription expired",
        message:
          "Your subscription has expired. Please renew to create new stores.",
      });
      return;
    }

    // Get the plan features
    const planFeatures = subscription.plan.features as any;

    // Check store creation limit
    if (planFeatures && typeof planFeatures.maxStores === "number") {
      const storeCount = await prisma.store.count({
        where: {
          ownerId: auth.user.id,
          status: {
            in: ["ACTIVE", "PENDING"],
          },
        },
      });

      if (storeCount >= planFeatures.maxStores) {
        res.status(403).json({
          error: "Store limit reached",
          message: `You have reached the maximum number of stores (${planFeatures.maxStores}) allowed by your ${subscription.plan.name} plan. Please upgrade your subscription to create more stores.`,
        });
        return;
      }
    }

    next();
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to verify store creation limit",
      message: err.message,
    });
  }
};

/**
 * Middleware to check if user has an active or grace period subscription
 * Grace period allows limited access even after expiration
 */
export const requireActiveOrGracePeriodSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // If it's an admin request, bypass subscription checks
    if (req.auth?.type === "admin") {
      next();
      return;
    }

    const authParsed = AuthSchema.safeParse(req.auth);

    if (!authParsed.success) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const auth = authParsed.data;

    // Check for active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: auth.user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      res.status(403).json({
        error: "Active subscription required",
        message:
          "You need an active subscription to perform this action. Your subscription may have expired beyond the grace period.",
      });
      return;
    }

    // Check if we're in grace period
    let inGracePeriod = false;
    if (
      subscription.expiresAt &&
      subscription.expiresAt < new Date() &&
      subscription.plan.gracePeriod
    ) {
      const graceExpiry = new Date(subscription.expiresAt);
      graceExpiry.setDate(
        graceExpiry.getDate() + subscription.plan.gracePeriod,
      );
      inGracePeriod = new Date() <= graceExpiry;
    }

    // If expired and not in grace period, deny access
    if (
      subscription.expiresAt &&
      subscription.expiresAt < new Date() &&
      !inGracePeriod
    ) {
      res.status(403).json({
        error: "Subscription expired",
        message:
          "Your subscription and grace period have expired. Please renew to continue using this feature.",
      });
      return;
    }

    next();
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to verify subscription",
      message: err.message,
    });
  }
};
