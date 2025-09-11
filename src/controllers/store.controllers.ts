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

export const getActiveStores = async (
  req: Request,
  res: Response
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

export const getStoreByUid = async (
  req: Request,
  res: Response
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
  res: Response
): Promise<void> => {
  const parsed = CreateStoreSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { type, domain, name, description, subscriptionId } = parsed.data;
  const { user } = authParsed.data;

  // Check if domain already exists
  const existingDomain = await prisma.store.findUnique({
    where: { uid: domain },
  });

  if (existingDomain) {
    res.status(400).json({ error: "Domain already taken" });
    return;
  }

  // Check if subscription already exists
  const existingSubscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, status: "ACTIVE" },
    include: { plan: true },
    orderBy: {
      expiresAt: "desc", // get latest subscription
    },
  });

  if (!existingSubscription) {
    res.status(400).json({ error: "Subscription not found" });
    return;
  }

  try {
    const { store } = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          uid: domain,
          type,
          name,
          description,
          plan: existingSubscription.plan.name,
          status: "PENDING",
          ownerId: user.id,
        },
      });

      const notificationDetails = buildNotification({
        category: "STORE",
        type: "STORE_CREATED",
        status: "success",
      });

      await tx.notification.create({
        data: {
          category: notificationDetails.category,
          title: notificationDetails.title,
          message: notificationDetails.message,
          userId: user.id,
          meta: notificationDetails.meta,
        },
      });
      return { store };
    });

    res.status(201).json({ success: "Store created successfully", store });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create store " + err.message });
  }
};

export const updateStore = async (
  req: Request,
  res: Response
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
  const { name, description } = bodyParsed.data;
  const { user } = authParsed.data;

  try {
    const store = await prisma.store.findUnique({ where: { uid } });
    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
      [];
    }

    if (store.ownerId !== user.id) {
      res.status(403).json({ error: "Unauthorized to update this store" });
      return;
    }

    const updatedStore = await prisma.store.update({
      where: { uid },
      data: {
        name: name || store.name,
        description: description || store.description,
      },
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
  res: Response
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
    const store = await prisma.store.findUnique({ where: { uid } });
    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    if (store.ownerId !== user.id) {
      res.status(403).json({ error: "Unauthorized to delete this store" });
      return;
    }

    await prisma.store.delete({ where: { uid } });
    res.status(200).json({ success: "Store deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete store " + err.message });
  }
};

export const getMyStores = async (
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

export const adminGetAllStores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const stores = await prisma.store.findMany({
      orderBy: { timestamp: "desc" },
    });
    res.status(200).json({ stores });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all stores " + err.message });
  }
};

export const adminGetStoreByUid = async (
  req: Request,
  res: Response
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
  res: Response
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

    res.status(200).json({ success: "Store approved", store: updatedStore });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to approve store " + err.message });
  }
};

export const suspendStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = AdminActionSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const { updatedStore } = await prisma.$transaction(async (tx) => {
      const updatedStore = await prisma.store.update({
        where: { uid },
        data: { status: "CANCELED" },
      });

      const notificationDetails = buildNotification({
        category: "STORE",
        type: "STORE_REJECTED",
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
    res.status(200).json({ success: "Store suspended", store: updatedStore });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to suspend store " + err.message });
  }
};

export const adminDeleteStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = AdminActionSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    await prisma.store.delete({ where: { uid } });
    res.status(200).json({ success: "Store deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete store " + err.message });
  }
};
