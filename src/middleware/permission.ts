import { prisma } from "../config/db.config";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if an admin has the required permissions
 * @param requiredPermissions Array of permissions (string) to check
 */
export const checkAdminPermission = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const admin = req?.auth?.user; // set by authenticateAdmin middleware
      if (!admin) {
        return res.status(401).json({ error: "Unauthorized user" });
      }

      // Fetch admin with role and permissions
      const dbAdmin = await prisma.admin.findUnique({
        where: { id: admin.id },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true, // Access AdminPermission model
                },
              },
            },
          },
        },
      });

      if (!dbAdmin || !dbAdmin.role) {
        return res.status(403).json({ error: "Admin role not assigned" });
      }

      // Extract permission names from role
      const userPermissions = dbAdmin.role.permissions.map(
        (rp) => rp.permission.name
      );

      // Check if all required permissions are present
      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return res.status(403).json({
          error: "You do not have permission to perform this action",
        });
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};
