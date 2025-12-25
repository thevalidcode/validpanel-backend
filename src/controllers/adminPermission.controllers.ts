import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CreatePermissionSchema, UidSchema } from "../schemas/admin.schema";

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
  const parsed = UidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { uid } = parsed.data;

  try {
    const permission = await prisma.adminPermission.findUnique({
      where: { uid },
      select: { id: true, name: true },
    });

    if (!permission) {
      res.status(404).json({ error: "Permission not found" });
      return;
    }

    // Protect system permission
    if (permission.name === "ALL_ACCESS") {
      res.status(403).json({
        error: "ALL_ACCESS permission cannot be deleted",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.adminRolePermission.deleteMany({
        where: {
          permissionId: permission.id,
        },
      });

      await tx.adminPermission.delete({
        where: {
          uid,
        },
      });
    });

    res.status(200).json({ success: "Permission deleted successfully" });
    return;
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to delete permission",
      details: err.message,
    });
    return;
  }
};

/**
 * update a Permission
 */
export const updatePermission = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = UidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data;

  const bodyParsed = CreatePermissionSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }
  const { name } = bodyParsed.data;
  try {
    await prisma.adminPermission.update({ where: { uid }, data: { name } });
    res.status(200).json({ success: "Permission updated successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to update permission: " + err.message });
  }
};
