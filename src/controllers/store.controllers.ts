import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import {
  CreateStoreSchema,
  UpdateStoreSchema,
  StoreUidSchema,
  AdminActionSchema,
} from "../schemas/store.schema";
import { AuthSchema } from "../schemas/user.schema";
import { buildNotification } from "../services/notification.services";
import { CreateStore, DeleteStore } from "../services/store";
import { sendUserEmail, sendEmailToAdmins } from "../emails";
import { env } from "../config/env.config";

async function ensureUserCanEnableReselling(userId: number): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (
    !subscription ||
    (subscription.expiresAt && subscription.expiresAt < new Date())
  ) {
    return false;
  }

  const features =
    (subscription.plan.features as Record<string, unknown> | null) || {};

  return Boolean(features.reselling);
}

export const getStoreByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = StoreUidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const store = await prisma.store.findUnique({ where: { uid } });
    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }
    res.status(200).json({ store });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch store " + err.message });
  }
};

export const createStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = CreateStoreSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(401).json({ error: "Unauthorized User." });
    return;
  }

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const {
    type,
    domain,
    name,
    description,
    subscriptionId,
    logoUrl,
    color,
    resellingEnabled,
  } = parsed.data;

  const { user } = authParsed.data;

  try {
    if (resellingEnabled) {
      const canEnableReselling = await ensureUserCanEnableReselling(user.id);
      if (!canEnableReselling) {
        res.status(403).json({
          error: "Reselling feature is not enabled for your plan",
        });
        return;
      }
    }

    /**
     * 1. Ensure domain is unique
     */
    const existingDomain = await prisma.store.findUnique({
      where: { uid: domain },
    });

    if (existingDomain) {
      res.status(400).json({ error: "Domain already taken" });
      return;
    }

    /**
     * 2. Fetch ACTIVE subscription that belongs to user
     */
    const subscription = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: user.id,
        status: "ACTIVE",
      },
      include: {
        plan: true,
        user: {
          include: {
            stores: true,
          },
        },
      },
    });

    if (!subscription) {
      res.status(400).json({ error: "Active subscription not found" });
      return;
    }

    /**
     * 3. Transaction: create store + logs
     */
    const { store, notification, platformEvent } = await prisma.$transaction(
      async (tx) => {
        const store = (await tx.store.create({
          data: {
            uid: domain,
            type,
            name,
            description,
            logoUrl,
            color,
            plan: subscription.plan.name,
            status: "PENDING",
            ownerId: user.id,
            resellingEnabled,
          } as any,
          include: {
            owner: true,
          },
        })) as any;

        const notificationDetails = buildNotification({
          category: "STORE",
          type: "STORE_CREATED",
          status: "success",
        });

        const notification = await tx.notification.create({
          data: {
            category: notificationDetails.category,
            title: notificationDetails.title,
            message: notificationDetails.message,
            meta: notificationDetails.meta,
            userId: user.id,
          },
        });

        const platformEvent = await tx.platformEvent.create({
          data: {
            event: "STORE_CREATED",
            category: "STORE",
            entityUid: store.uid,
            userId: user.id,
          },
        });

        return { store, notification, platformEvent };
      },
      {
        isolationLevel: "Serializable",
      },
    );

    /**
     * 4. Post-creation side effects
     */
    try {
      await CreateStore(store.owner, store);
    } catch (err: any) {
      // Revert: delete the created store and related records
      await prisma.$transaction(async (tx) => {
        await tx.notification.delete({
          where: { userId: user.id, uid: notification.uid },
        });
        await tx.platformEvent.delete({
          where: { uid: platformEvent.uid },
        });
        await tx.store.delete({ where: { uid: store.uid } });
      });
      throw err;
    }

    // Send store created email and admin notifications in production
    if (env.NODE_ENV === "production") {
      await sendUserEmail(store.owner.email, "STORE_CREATED", {
        firstName: store.owner.fullName?.split(" ")[0] || "User",
        storeName: store.name,
        storeDomain: store.uid,
        storeType: store.type,
      });

      await sendEmailToAdmins("ADMIN_NEW_STORE", {
        storeName: store.name,
        storeId: store.uid,
        ownerName: store.owner.fullName || "Unknown",
        ownerEmail: store.owner.email,
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Send approval required notification to admins
      await sendEmailToAdmins("ADMIN_STORE_APPROVAL_REQUIRED", {
        storeName: store.name,
        storeId: store.uid,
        ownerName: store.owner.fullName || "Unknown",
        ownerEmail: store.owner.email,
        description: store.description || undefined,
        createdAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }

    res.status(201).json({
      success: "Store created successfully",
      store,
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to create store",
    });
    console.log({ error: "Failed to create store" + err });
  }
};

export const updateStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const uidParsed = StoreUidSchema.safeParse(req.params);
  if (!uidParsed.success) {
    res.status(400).json({ error: uidParsed.error.flatten() });
    return;
  }

  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const bodyParsed = UpdateStoreSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { uid } = uidParsed.data;
  const { name, description, logoUrl, color, status, resellingEnabled } =
    bodyParsed.data;
  const { user } = authParsed.data;

  try {
    const store = await prisma.store.findUnique({
      where: { uid, ownerId: user.id },
    });

    if (!store) {
      res.status(404).json({ error: "No store was found for this update" });
      return;
    }

    if (store.status === "PENDING") {
      res.status(400).json({
        error: "Cannot update a store while it's on pending approval.",
      });
      return;
    }

    if (resellingEnabled === true) {
      const canEnableReselling = await ensureUserCanEnableReselling(user.id);
      if (!canEnableReselling) {
        res.status(403).json({
          error: "Reselling feature is not enabled for your plan",
        });
        return;
      }
    }

    const updatedStore = await prisma.$transaction(async (tx) => {
      const data = await tx.store.update({
        where: { uid },
        include: { owner: true },
        data: {
          name: name ?? store.name,
          color: color ?? store.color,
          logoUrl: logoUrl ?? store.logoUrl,
          status: status ?? store.status,
          description: description ?? store.description,
          resellingEnabled:
            resellingEnabled ?? (store as any).resellingEnabled ?? false,
        } as any,
      });

      await tx.resellerStore.update({
        where: { storeId: data.storeId },
        data: {
          isActive:
            resellingEnabled ?? (store as any).resellingEnabled ?? false,
        },
      });
      return data;
    });

    res
      .status(200)
      .json({ success: "Store updated successfully", store: updatedStore });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update store " + err.message });
  }
};

export const deleteStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = StoreUidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;
  const { user } = authParsed.data;

  try {
    const store = await prisma.store.findUnique({
      where: { uid },
      include: { owner: true },
    });
    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    if (store.ownerId !== user.id) {
      res.status(403).json({ error: "Unauthorized to delete this store" });
      return;
    }

    // Send store deleted email before deletion in production
    if (env.NODE_ENV === "production") {
      await sendUserEmail(store.owner.email, "STORE_DELETED", {
        firstName: store.owner.fullName?.split(" ")[0] || "User",
        storeName: store.name,
      });
    }

    await DeleteStore(store.owner, store);
    await prisma.store.delete({ where: { uid } });
    res.status(200).json({ success: "Store deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete store " + err.message });
  }
};

export const getMyStores = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;
  try {
    const stores = await prisma.store.findMany({
      where: { ownerId: user.id },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json({ stores });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch user stores " + err.message });
  }
};

// Admin Controllers

export const getActiveStores = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const stores = await prisma.store.findMany({
      where: { status: "ACTIVE" },
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json({ stores });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch stores " + err.message });
  }
};

export const adminGetAllStores = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { timestamp: "desc" },
      include: { owner: true },
    });
    res.status(200).json({ stores });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all stores " + err.message });
  }
};

export const getStoreStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const startOfMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );

    const [allStores, activeStores, pausedStores, storesThisMonth] =
      await Promise.all([
        prisma.store.findMany({
          orderBy: { timestamp: "desc" },
          include: { owner: true },
        }),

        prisma.store.findMany({
          where: { status: "ACTIVE" },
        }),

        prisma.store.findMany({
          where: { status: "DISABLED" },
        }),

        prisma.store.findMany({
          where: {
            timestamp: {
              gte: startOfMonth,
            },
          },
        }),
      ]);

    res.status(200).json({
      counts: {
        total: allStores.length,
        active: activeStores.length,
        paused: pausedStores.length,
        createdThisMonth: storesThisMonth.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to fetch store statistics",
      message: err.message,
    });
  }
};

export const adminGetStoreByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = StoreUidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const store = await prisma.store.findUnique({ where: { uid } });
    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    res.status(200).json({ store });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch store " + err.message });
  }
};

export const approveStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = AdminActionSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const { updatedStore } = await prisma.$transaction(async (tx) => {
      const updatedStore = await tx.store.update({
        where: { uid },
        include: { owner: true },
        data: { status: "ACTIVE" },
      });
      const notificationDetails = buildNotification({
        category: "STORE",
        type: "STORE_APPROVED",
        status: "success",
      });

      await tx.notification.create({
        data: {
          category: notificationDetails.category,
          title: notificationDetails.title,
          message: notificationDetails.message,
          userId: updatedStore.ownerId,
          meta: notificationDetails.meta,
        },
      });
      return { updatedStore };
    });

    // Send store approved email in production
    if (env.NODE_ENV === "production") {
      await sendUserEmail(updatedStore.owner.email, "STORE_APPROVED", {
        firstName: updatedStore.owner.fullName?.split(" ")[0] || "User",
        storeName: updatedStore.name,
        storeDomain: updatedStore.uid,
      });
    }

    res.status(200).json({ success: "Store approved", store: updatedStore });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to approve store " + err.message });
  }
};

export const pauseStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = AdminActionSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const { updatedStore } = await prisma.$transaction(async (tx) => {
      const updatedStore = await tx.store.update({
        where: { uid },
        include: { owner: true },
        data: { status: "DISABLED" },
      });
      const notificationDetails = buildNotification({
        category: "STORE",
        type: "STORE_PAUSED",
        status: "success",
      });

      await tx.notification.create({
        data: {
          category: notificationDetails.category,
          title: notificationDetails.title,
          message: notificationDetails.message,
          userId: updatedStore.ownerId,
          meta: notificationDetails.meta,
        },
      });
      return { updatedStore };
    });

    // Send store paused email in production
    if (env.NODE_ENV === "production") {
      await sendUserEmail(updatedStore.owner.email, "STORE_PAUSED", {
        firstName: updatedStore.owner.fullName?.split(" ")[0] || "User",
        storeName: updatedStore.name,
        reason: "Administrative action",
      });
    }

    res.status(200).json({ success: "Store paused", store: updatedStore });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: "Failed to pause store " + err.message });
  }
};

export const adminUpdateStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const uidParsed = StoreUidSchema.safeParse(req.params);
  if (!uidParsed.success) {
    res.status(400).json({ error: uidParsed.error.flatten() });
    return;
  }

  const bodyParsed = UpdateStoreSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  const { uid } = uidParsed.data;
  const { name, description, logoUrl, color, status, resellingEnabled } =
    bodyParsed.data;

  try {
    const store = await prisma.store.findUnique({
      where: { uid },
    });

    if (!store) {
      res.status(404).json({ error: "No store was found for this update" });
      return;
    }

    const previousStatus = store.status;

    const updatedStore = (await prisma.store.update({
      where: { uid },
      include: { owner: true },
      data: {
        name: name ?? store.name,
        color: color ?? store.color,
        logoUrl: logoUrl ?? store.logoUrl,
        status: status ?? store.status,
        description: description ?? store.description,
        resellingEnabled:
          resellingEnabled ?? (store as any).resellingEnabled ?? false,
      } as any,
    })) as any;

    // Send reactivation email if store was reactivated in production
    if (
      env.NODE_ENV === "production" &&
      previousStatus === "DISABLED" &&
      updatedStore.status === "ACTIVE"
    ) {
      await sendUserEmail(updatedStore.owner.email, "STORE_REACTIVATED", {
        firstName: updatedStore.owner.fullName?.split(" ")[0] || "User",
        storeName: updatedStore.name,
      });
    }

    res
      .status(200)
      .json({ success: "Store updated successfully", store: updatedStore });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update store " + err.message });
  }
};

export const adminDeleteStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = AdminActionSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const store = await prisma.store.findUnique({
      where: { uid },
      include: { owner: true },
    });

    if (!store) {
      res.status(404).json({ error: "No store was found for this delete" });
      return;
    }

    // Send store deleted email before deletion in production
    if (env.NODE_ENV === "production") {
      await sendUserEmail(store.owner.email, "STORE_DELETED", {
        firstName: store.owner.fullName?.split(" ")[0] || "User",
        storeName: store.name,
      });
    }

    await DeleteStore(store.owner, store);
    await prisma.store.delete({ where: { uid } });
    res.status(200).json({ success: "Store deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete store " + err.message });
  }
};
