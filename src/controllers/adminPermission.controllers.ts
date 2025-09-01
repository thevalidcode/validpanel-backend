import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  CreatePermissionSchema,
  UidSchema,
} from "../schemas/admin.schema";

/**
 * Create a new Permission
 */
export const createPermission = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = CreatePermissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name } = parsed.data;

  try {
    const existingPermission = await prisma.adminPermission.findFirst({
      where: { name },
    });

    if (existingPermission) {
      res.status(400).json({ error: "Permission already exists" });
      return;
    }

    const permission = await prisma.adminPermission.create({
      data: {
        uid: uuidv4(),
        name,
      },
    });

    res
      .status(201)
      .json({ success: "Permission created successfully", permission });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to create permission: " + err.message });
  }
};

/**
 * Get all Permissions
 */
export const getPermissions = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const permissions = await prisma.adminPermission.findMany();
    res.status(200).json({ permissions });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch permissions: " + err.message });
  }
};

/**
 * Delete a Permission
 */
export const deletePermission = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = UidSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;

  try {
    await prisma.adminPermission.delete({ where: { uid } });
    res.status(200).json({ success: "Permission deleted successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to delete permission: " + err.message });
  }
};
