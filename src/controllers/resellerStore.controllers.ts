import type { Request, Response } from "express";
import {
  AdminResellerStoreListQuerySchema,
  ResellerStoreCreateSchema,
  ResellerStoreListQuerySchema,
  ResellerStoreUidParamsSchema,
  ResellerStoreUpdateSchema,
} from "../schemas/resellerStore.schema";
import {
  createResellerStore,
  deleteResellerStore,
  getResellerStoreByUid,
  listAdminResellerStores,
  listResellerStores,
  updateResellerStore,
} from "../services/resellerStore.service";

export const getResellerStores = async (req: Request, res: Response) => {
  const parsed = ResellerStoreListQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await listResellerStores(parsed.data, undefined);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch reseller stores" });
  }
};

export const createResellerStoreRecord = async (
  req: Request,
  res: Response,
) => {
  const parsed = ResellerStoreCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await createResellerStore(parsed.data);
    res.status(201).json({ success: true, resellerStore: result });
  } catch (error: any) {
    if (error.message === "RESELLER_STORE_ALREADY_EXISTS") {
      res.status(409).json({ error: "Reseller store already exists" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to create reseller store" });
  }
};

export const getAdminResellerStores = async (req: Request, res: Response) => {
  const parsed = AdminResellerStoreListQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await listAdminResellerStores(parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch reseller stores" });
  }
};

export const getAdminResellerStoreByUid = async (
  req: Request,
  res: Response,
) => {
  const parsed = ResellerStoreUidParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const resellerStore = await getResellerStoreByUid(parsed.data.uid);
    if (!resellerStore) {
      res.status(404).json({ error: "Reseller store not found" });
      return;
    }
    res.status(200).json({ resellerStore });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch reseller store" });
  }
};

export const updateAdminResellerStore = async (req: Request, res: Response) => {
  const paramsParsed = ResellerStoreUidParamsSchema.safeParse(req.params);
  const bodyParsed = ResellerStoreUpdateSchema.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  try {
    const resellerStore = await updateResellerStore(
      paramsParsed.data.uid,
      bodyParsed.data,
    );
    res.status(200).json({ success: true, resellerStore });
  } catch (error: any) {
    if (error.message === "RESELLER_STORE_NOT_FOUND") {
      res.status(404).json({ error: "Reseller store not found" });
      return;
    }
    if (error.message === "RESELLER_STORE_ALREADY_EXISTS") {
      res.status(409).json({ error: "Reseller store already exists" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to update reseller store" });
  }
};

export const deleteAdminResellerStore = async (req: Request, res: Response) => {
  const parsed = ResellerStoreUidParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    await deleteResellerStore(parsed.data.uid);
    res.status(200).json({ success: true });
  } catch (error: any) {
    if (error.message === "RESELLER_STORE_NOT_FOUND") {
      res.status(404).json({ error: "Reseller store not found" });
      return;
    }
    if (error.message === "INTERNAL_RESELLER_STORE_DELETE_FORBIDDEN") {
      res
        .status(403)
        .json({ error: "Internal reseller stores cannot be deleted" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to delete reseller store" });
  }
};
