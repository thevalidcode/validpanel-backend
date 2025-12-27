import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import {
  CreateServiceProviderSchema,
  UpdateServiceProviderSchema,
  UpdateServiceProviderStatusSchema,
  GetServiceProviderByUidSchema,
  DeleteServiceProviderSchema,
  GetAllServiceProvidersQuerySchema,
} from "../schemas/serviceApiProvider.schema";

/**
 * Create a new Service API Provider
 */
export const createServiceProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = CreateServiceProviderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { name, url, image } = parsed.data;

  try {
    const provider = await prisma.serviceApiProvider.create({
      data: {
        name,
        url,
        image,
      },
    });

    res.status(201).json({ success: true, data: provider });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to create service provider: " + err.message });
  }
};

/**
 * Get all Service API Providers (with filters, pagination)
 */
export const getAllServiceProviders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = GetAllServiceProvidersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { status, page = 1, limit = 20, search } = parsed.data;
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: "insensitive" };

    const [providers, total] = await Promise.all([
      prisma.serviceApiProvider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceApiProvider.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      providers,
      pagination: {
        total,
        page,
        limit,
      },
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch providers: " + err.message });
  }
};

/**
 * Get all Service API Providers (with filters, pagination)
 */
export const getActiveServiceProviders = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = GetAllServiceProvidersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { page = 1, limit = 20, search } = parsed.data;
  const skip = (page - 1) * limit;

  try {
    const where: any = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    where.status = "ACTIVE";

    const [providers, total] = await Promise.all([
      prisma.serviceApiProvider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.serviceApiProvider.count({ where }),
    ]);

    res.status(200).json({
      success: "Successfully fetched active service-api-providers",
      providers,
      pagination: {
        total,
        page,
        limit,
      },
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch active providers: " + err.message });
  }
};

/**
 * Get a specific Service API Provider by UID
 */
export const getServiceProviderByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = GetServiceProviderByUidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const provider = await prisma.serviceApiProvider.findUnique({
      where: { uid },
    });
    if (!provider) {
      res.status(404).json({ error: "Service provider not found" });
      return;
    }

    res.status(200).json({ success: true, data: provider });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch service provider: " + err.message });
  }
};

/**
 * Update a Service API Provider details
 */
export const updateServiceProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = GetServiceProviderByUidSchema.safeParse(req.params);
  const bodyParsed = UpdateServiceProviderSchema.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: paramsParsed.error?.flatten() || bodyParsed.error?.flatten(),
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const { name, url, image } = bodyParsed.data;

  try {
    const provider = await prisma.serviceApiProvider.update({
      where: { uid },
      data: { name, url, image },
    });

    res.status(200).json({ success: true, data: provider });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to update service provider: " + err.message });
  }
};

/**
 * Update Service API Provider status
 */
export const updateServiceProviderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = GetServiceProviderByUidSchema.safeParse(req.params);
  const bodyParsed = UpdateServiceProviderStatusSchema.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: paramsParsed.error?.flatten() || bodyParsed.error?.flatten(),
    });
    return;
  }

  const { uid } = paramsParsed.data;
  const { status } = bodyParsed.data;

  try {
    const provider = await prisma.serviceApiProvider.update({
      where: { uid },
      data: { status },
    });

    res.status(200).json({ success: true, data: provider });
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to update service provider status: " + err.message,
    });
  }
};

/**
 * Delete a Service API Provider
 */
export const deleteServiceProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = DeleteServiceProviderSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    await prisma.serviceApiProvider.delete({ where: { uid } });
    res.status(200).json({
      success: true,
      message: "Service provider deleted successfully",
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to delete service provider: " + err.message });
  }
};
