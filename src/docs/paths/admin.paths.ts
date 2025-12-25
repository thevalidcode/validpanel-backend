import { registry } from "../components/registry";
import {
  AuthenticateAdminSchema,
  NameSchema,
  UidSchema,
  CreatePermissionSchema,
  updateAdminSchema,
  createAdminRequestSchema,
  RoleFormSchema,
} from "../../schemas/admin.schema";
import {
  AuthenticateAdminResponse,
  CreateRoleResponse,
  DeletePermissionResponse,
  GetPermissionsResponse,
  CreatePermissionResponse,
  AssignPermissionToRoleResponse,
  GetRolesResponse,
  GetRoleByUidResponse,
  UpdateRoleResponse,
  DeleteRoleResponse,
  AdminListResponse,
  PlatformEventsListResponse,
} from "../responses/admin.response";
import {
  BadRequest,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";
import { OverviewResponse } from "../responses/admin.response";

/**
 * =========================
 * ADMIN ROUTES
 * =========================
 */

// Authenticate admin
registry.registerPath({
  method: "post",
  path: "/admins/me",
  summary: "Authenticate admin",
  tags: ["Admins"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthenticateAdminSchema,
        },
      },
    },
  },
  responses: {
    200: AuthenticateAdminResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Overview
registry.registerPath({
  method: "get",
  path: "/admins/overview",
  summary: "Admin overview",
  tags: ["Admins"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: OverviewResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/admins",
  summary: "Admin list",
  tags: ["Admins"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: AdminListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/admins/platform-events",
  summary: "Platform events",
  tags: ["Admins"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: PlatformEventsListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "put",
  path: "/admins/me",
  summary: "Update my admin profile",
  tags: ["Admins"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateAdminSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "put",
  path: "/admins/{uid}",
  summary: "Update an admin",
  tags: ["Admins"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
    body: {
      content: {
        "application/json": {
          schema: updateAdminSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "delete",
  path: "/admins/{uid}",
  summary: "Delete an admin",
  tags: ["Admins"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/admins",
  summary: "Create an admin",
  tags: ["Admins"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createAdminRequestSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});

/**
 * =========================
 * ROLE ROUTES
 * =========================
 */

// Create Role
registry.registerPath({
  method: "post",
  path: "/admins/roles",
  summary: "Create a new role",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RoleFormSchema,
        },
      },
    },
  },
  responses: {
    201: CreateRoleResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Get all roles
registry.registerPath({
  method: "get",
  path: "/admins/roles",
  summary: "Get all roles",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: GetRolesResponse,
    500: ServerError,
  },
});

// Get role by UID
registry.registerPath({
  method: "get",
  path: "/admins/roles/{uid}",
  summary: "Get a role by UID",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: GetRoleByUidResponse,
    400: BadRequest,
    404: {
      description: "Role not found",
    },
    500: ServerError,
  },
});

// Update role
registry.registerPath({
  method: "put",
  path: "/admins/roles/{uid}",
  summary: "Update a role",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
    body: {
      content: {
        "application/json": {
          schema: RoleFormSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateRoleResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Delete role
registry.registerPath({
  method: "delete",
  path: "/admins/roles/{uid}",
  summary: "Delete a role",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: DeleteRoleResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Assign permission to role
registry.registerPath({
  method: "put",
  path: "/admins/roles/{uid}/permissions",
  summary: "Assign a permission to a role",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
    body: {
      content: {
        "application/json": {
          schema: UidSchema, // for permission UID
        },
      },
    },
  },
  responses: {
    200: AssignPermissionToRoleResponse,
    400: BadRequest,
    500: ServerError,
  },
});

/**
 * =========================
 * PERMISSION ROUTES
 * =========================
 */

// Create permission
registry.registerPath({
  method: "post",
  path: "/admins/permissions",
  summary: "Create a new permission",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePermissionSchema,
        },
      },
    },
  },
  responses: {
    201: CreatePermissionResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Get all permissions
registry.registerPath({
  method: "get",
  path: "/admins/permissions",
  summary: "Get all permissions",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: GetPermissionsResponse,
    500: ServerError,
  },
});

// Delete permission
registry.registerPath({
  method: "delete",
  path: "/admins/permissions/{uid}",
  summary: "Delete a permission",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
  },
  responses: {
    200: DeletePermissionResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// update a permission
registry.registerPath({
  method: "patch",
  path: "/admins/permissions/{uid}",
  summary: "Update a permission",
  tags: ["Admin Roles & Permissions"],
  security: [{ CookieAuth: [] }],
  request: {
    params: UidSchema,
    body: {
      content: {
        "application/json": {
          schema: CreatePermissionSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});
