import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Admin,
  AdminPermission,
  AdminRole,
  AdminStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const AdminSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    uid: z.string(),
    apiKey: z.string(),
    image: z.string().url().nullable(),
    fullName: z.string(),
    lastSeen: z.coerce.date(),
    timestamp: z.coerce.date(),
    updatedAt: z.coerce.date(),
    status: z.nativeEnum(AdminStatus),
    roleId: z.number(),
  })
  .openapi("Admin");

export const RoleSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    uid: z.string().uuid(),
  })
  .openapi("AdminRole");

export const PermissionSchema: z.ZodType<AdminPermission> = z
  .object({
    id: z.number(),
    name: z.string(),
    uid: z.string().uuid(),
  })
  .openapi("AdminPermission");

export const RoleWithPermissionsSchema = RoleSchema.extend({
  permissions: z.array(
    z.object({
      permission: PermissionSchema,
    })
  ),
});

export const GoogleAuthRequestSchema = z
  .object({
    id_token: z.string().describe("Google OAuth ID token"),
  })
  .openapi("GoogleAuthResponse");

export const AuthenticateAdminSchema = z.object({
  email: z.string().email().describe("Admin email"),
  password: z.string().describe("Admin password"),
});

export const createAdminRequestSchema = z.object({
  email: z.string().email(),
  roleId: z.number(),
  fullName: z.string(),
  image: z.string().optional(),
  password: z.string().min(6),
});

export const updateAdminSchema = z.object({
  email: z.string().email().optional(),
  roleId: z.number().optional(),
  image: z.string().optional(),
  status: z.nativeEnum(AdminStatus).optional(),
  fullName: z.string().optional(),
});

export const CreatePermissionSchema = z.object({
  name: z.coerce.string().toUpperCase(),
});

export const NameSchema = z.object({
  name: z.string(),
});

export const RoleFormSchema = z.object({
  name: z.string(),
  permissionIds: z.array(z.number()),
});

export const UidSchema = z.object({
  uid: z.string(),
});

export const SuccessMessageSchema = z.object({
  success: z.string().describe("Admin operation was successful"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  email: z.string().email(),
  password: z.string(),
});

export const VerifySessionSchema = z.object({
  sessionCode: z.string(),
});

export const AdminAuthSchema = z.object({
  uid: z.string(),
  type: z.literal("admin"),
  user: AdminSchema,
});
