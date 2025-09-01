import { z } from "zod";
import {
  RoleSchema,
  PermissionSchema,
  SuccessMessageSchema,
  AuthenticateAdminResponseSchema,
} from "../../schemas/admin.schema";

export const AuthenticateAdminResponse = {
  description: "Authenticated admin session object",
  content: {
    "application/json": {
      schema: AuthenticateAdminResponseSchema,
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
