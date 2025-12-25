import { prisma } from "../config/db.config";
import type { Request, Response } from "express";
import { NameSchema, UidSchema, RoleFormSchema } from "../schemas/admin.schema";

/**
 * Create a new Role
 */
export const createRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = RoleFormSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, permissionIds } = parsed.data;

  try {
    const existingRole = await prisma.adminRole.findFirst({ where: { name } });
    if (existingRole) {
      res.status(400).json({ error: "Role already exists" });
      return;
    }

    const role = await prisma.adminRole.create({
      data: {
        name,
      },
    });

    // Assign permissions
    if (permissionIds.length > 0) {
      const permissions = await prisma.adminPermission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (permissions.length !== permissionIds.length) {
        // Some permissions not found, but continue or error?
        // For now, assign only existing ones
      }
      await prisma.adminRolePermission.createMany({
        data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
      });
    }

    // Fetch role with permissions
    const roleWithPermissions = await prisma.adminRole.findUnique({
      where: { id: role.id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    res
      .status(201)
      .json({
        success: "Role created successfully",
        role: roleWithPermissions,
      });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create role: " + err.message });
  }
};

/**
 * Get all Roles
 */
export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await prisma.adminRole.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    res.status(200).json({ roles });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch roles: " + err.message });
  }
};

/**
 * Get Role by UID
 */
export const getRoleByUid = async (
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
    const role = await prisma.adminRole.findUnique({
      where: { uid },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    res.status(200).json({ role });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch role: " + err.message });
  }
};

/**
 * Update Role
 */
export const updateRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const paramsParsed = UidSchema.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.flatten() });
    return;
  }
  const { uid } = paramsParsed.data;
  const parsed = RoleFormSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { name, permissionIds } = parsed.data;

  try {
    const role = await prisma.adminRole.update({
      where: { uid },
      data: { name },
    });

    // Remove existing permissions
    await prisma.adminRolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Assign new permissions
    if (permissionIds.length > 0) {
      const permissions = await prisma.adminPermission.findMany({
        where: { id: { in: permissionIds } },
      });
      await prisma.adminRolePermission.createMany({
        data: permissions.map((p) => ({ roleId: role.id, permissionId: p.id })),
      });
    }

    // Fetch updated role with permissions
    const roleWithPermissions = await prisma.adminRole.findUnique({
      where: { id: role.id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    res
      .status(200)
      .json({
        success: "Role updated successfully",
        role: roleWithPermissions,
      });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update role: " + err.message });
  }
};

/**
 * Delete Role
 */
export const deleteRole = async (
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
    const role = await prisma.adminRole.findUnique({
      where: { uid },
      select: { id: true, name: true },
    });

    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    // Protect system roles
    if (
      role.name === "ADMIN" ||
      role.name === "SUPER_ADMIN" ||
      role.name === "Super Admin"
    ) {
      res.status(403).json({ error: "System roles cannot be deleted" });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.adminRolePermission.deleteMany({
        where: {
          roleId: role.id,
        },
      });

      await tx.adminRole.delete({
        where: {
          uid,
        },
      });
    });

    res.status(200).json({ success: "Role deleted successfully" });
    return;
  } catch (err: any) {
    res.status(500).json({
      error: "Failed to delete role",
      details: err.message,
    });
    return;
  }
};

/**
 * Assign Permission to Role
 */
export const assignPermissionToRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = UidSchema.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { uid } = parsed.data; // role UID
  const bodyParsed = UidSchema.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.flatten() });
    return;
  }
  const { uid: permissionUid } = bodyParsed.data;

  try {
    const role = await prisma.adminRole.findUnique({ where: { uid } });
    const permission = await prisma.adminPermission.findUnique({
      where: { uid: permissionUid },
    });

    if (!role || !permission) {
      res.status(404).json({ error: "Role or permission not found" });
      return;
    }

    const existing = await prisma.adminRolePermission.findFirst({
      where: { roleId: role.id, permissionId: permission.id },
    });

    if (existing) {
      res
        .status(400)
        .json({ error: "Permission already assigned to this role" });
      return;
    }

    await prisma.adminRolePermission.create({
      data: {
        roleId: role.id,
        permissionId: permission.id,
      },
    });

    res
      .status(200)
      .json({ success: "Permission assigned to role successfully" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to assign permission: " + err.message });
  }
};
