import { z } from "zod";
import {
  RoleSchema,
  PermissionSchema,
  SuccessMessageSchema,
  AuthenticateAdminResponseSchema,
} from "../../schemas/admin.schema";
import { Decimal } from "@prisma/client/runtime/library";
import { NotificationSchema } from "../../schemas/notification.schema";
import { OrderSchema } from "../../schemas/order.schema";

export const AuthenticateAdminResponse = {
  description: "Authenticated admin session object",
  content: {
    "application/json": {
      schema: AuthenticateAdminResponseSchema,
    },
  },
};

export const DashboardOverviewResponse = {
  description: "Overview retrieved successfully",
  content: {
    "application/json": {
      schema: z.object({
        totalUsers: z.number(),
        totalStores: z.number(),
        activeStores: z.number(),
        totalRevenue: z.object({
          currency: z.string().length(3),
          amount: z.custom<Decimal>(),
        }),
        recentActivity: z.array(NotificationSchema),
        recentOrders: z.array(OrderSchema),
      }),
    },
  },
};

/**
 * Role Responses
 */
export const CreateRoleResponse = {
  description: "Successfully created a new role",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        role: RoleSchema,
      }),
    },
  },
};

export const GetRolesResponse = {
  description: "Retrieve all roles with their permissions",
  content: {
    "application/json": {
      schema: z.object({
        roles: z.array(RoleSchema),
      }),
    },
  },
};

export const GetRoleByUidResponse = {
  description: "Retrieve a specific role by UID",
  content: {
    "application/json": {
      schema: z.object({
        role: RoleSchema,
      }),
    },
  },
};

export const UpdateRoleResponse = {
  description: "Successfully updated a role",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        role: RoleSchema,
      }),
    },
  },
};

export const DeleteRoleResponse = {
  description: "Successfully deleted a role",
  content: {
    "application/json": {
      schema: SuccessMessageSchema,
    },
  },
};

export const AssignPermissionToRoleResponse = {
  description: "Successfully assigned permission to a role",
  content: {
    "application/json": {
      schema: SuccessMessageSchema,
    },
  },
};

/**
 * Permission Responses
 */
export const CreatePermissionResponse = {
  description: "Successfully created a new permission",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        permission: PermissionSchema,
      }),
    },
  },
};

export const GetPermissionsResponse = {
  description: "Retrieve all permissions",
  content: {
    "application/json": {
      schema: z.object({
        permissions: z.array(PermissionSchema),
      }),
    },
  },
};

export const DeletePermissionResponse = {
  description: "Successfully deleted a permission",
  content: {
    "application/json": {
      schema: SuccessMessageSchema,
    },
  },
};
