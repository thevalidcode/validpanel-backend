import type { Request, Response } from "express";
import {
  ProviderIdParamsSchema,
  SupplierIdParamsSchema,
  SourceStoresQuerySchema,
  StartResellingSchema,
  SyncResellerStoreParamsSchema,
  SyncResellerStoreSchema,
} from "../schemas/reseller.schema";
import {
  getResellerSourceProducts,
  getResellerSourceServices,
  getResellerSourceStores,
  startReselling,
  syncResellerStore,
} from "../services/reseller.service";

export const getSources = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = SourceStoresQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await getResellerSourceStores(parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch reseller sources" });
  }
};

export const getSourceProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = SupplierIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await getResellerSourceProducts(parsed.data.supplierId);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to fetch source products" });
  }
};

export const getSourceServices = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = ProviderIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await getResellerSourceServices(parsed.data.providerId);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "PROVIDER_NOT_FOUND") {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    if (error.message === "SELF_RESELLING_NOT_ALLOWED") {
      res
        .status(400)
        .json({ error: "You cannot resell from the same source store" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to fetch source services" });
  }
};

export const postStartReselling = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = StartResellingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await startReselling(req.auth, parsed.data);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (error.message === "ACTIVE_SUBSCRIPTION_REQUIRED") {
      res.status(403).json({ error: "Active subscription required" });
      return;
    }
    if (error.message === "TARGET_STORE_REQUIRED") {
      res.status(400).json({ error: "Target store is required" });
      return;
    }
    if (error.message === "SUBSCRIPTION_EXPIRED") {
      res.status(403).json({ error: "Subscription expired" });
      return;
    }
    if (error.message === "RESELLING_FEATURE_DISABLED") {
      res
        .status(403)
        .json({ error: "Reselling feature is not enabled for your plan" });
      return;
    }
    if (error.message === "TARGET_STORE_NOT_FOUND") {
      res.status(404).json({ error: "Target store not found" });
      return;
    }
    if (error.message === "DOMAIN_TAKEN") {
      res.status(409).json({ error: "Domain already taken" });
      return;
    }
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }
    if (error.message === "PROVIDER_NOT_FOUND") {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    if (error.message === "SELF_RESELLING_NOT_ALLOWED") {
      res
        .status(400)
        .json({ error: "You cannot resell from the same source store" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to start reselling" });
  }
};

export const postSyncResellerStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const paramsParsed = SyncResellerStoreParamsSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }

  const bodyParsed = SyncResellerStoreSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }

  try {
    const result = await syncResellerStore(
      req.auth,
      paramsParsed.data.targetStoreUid,
      bodyParsed.data,
    );
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (error.message === "ACTIVE_SUBSCRIPTION_REQUIRED") {
      res.status(403).json({ error: "Active subscription required" });
      return;
    }
    if (error.message === "SUBSCRIPTION_EXPIRED") {
      res.status(403).json({ error: "Subscription expired" });
      return;
    }
    if (error.message === "RESELLING_FEATURE_DISABLED") {
      res
        .status(403)
        .json({ error: "Reselling feature is not enabled for your plan" });
      return;
    }
    if (error.message === "TARGET_STORE_NOT_FOUND") {
      res.status(404).json({ error: "Target store not found" });
      return;
    }
    if (error.message === "SUPPLIER_NOT_FOUND") {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }
    if (error.message === "PROVIDER_NOT_FOUND") {
      res.status(404).json({ error: "Provider not found" });
      return;
    }

    res
      .status(500)
      .json({ error: error.message || "Failed to sync reseller store" });
  }
};
