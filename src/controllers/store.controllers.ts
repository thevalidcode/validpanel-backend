import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import {
  CreateStoreSchema,
  UpdateStoreSchema,
  StoreUidSchema,
  AdminActionSchema,
} from "../schemas/store.schema";
import { AuthSchema } from "../schemas/user.schema";

export const getStores = async (req: Request, res: Response): Promise<void> => {
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

  const { type, domain, name, description } = parsed.data;
  const { user } = authParsed.data;

  try {
    const store = await prisma.$transaction(async (tx) => {
      const lastStore = await tx.store.findFirst({
        orderBy: { storeId: "desc" },
        select: { storeId: true },
      });

      const newStoreId = lastStore ? lastStore.storeId + 1 : 1;

      const store = await tx.store.create({
        data: {
          uid: domain,
          type,
          name,
          description,
          plan: "FREE",
          status: "PENDING",
          storeId: newStoreId,
          owner: {
            connect: { id: user.id },
          },
        },
      });

      return store;
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
      return;[]
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
        plan: user.plan,
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
    const updatedStore = await prisma.store.update({
      where: { uid },
      data: { status: "ACTIVE" },
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
    const updatedStore = await prisma.store.update({
      where: { uid },
      data: { status: "DISABLED" },
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
