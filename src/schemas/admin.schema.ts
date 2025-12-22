import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Admin,
  AdminPermission,
  AdminRole,
  AdminStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const AdminSchema: z.ZodType<Admin> = z
  .object({
    id: z.number(),
    email: z.string().email(),
    uid: z.string().uuid(),
    apiKey: z.string().uuid(),
    image: z.string().url(),
    password: z.string(),
    currency: z.string().toUpperCase().length(3),
    fullName: z.string(),
    lastSeen: z.coerce.date(),
    timestamp: z.coerce.date(),
    updatedAt: z.coerce.date(),
    resetToken: z.string(),
    resetTokenExpiry: z.coerce.date(),
    status: z.nativeEnum(AdminStatus),
    roleId: z.number(),
  })
  .openapi("Admin");

export const RoleSchema: z.ZodType<AdminRole> = z
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
  fullName: z.string(),
  password: z.string().min(6),
});

export const updateAdminSchema = z.object({
  uid: z.string(),
  username: z.string().optional(),
  fullName: z.string().optional(),
});

export const CreatePermissionSchema = z.object({
  name: z.coerce.string().toUpperCase(),
});

export const NameSchema = z.object({
  name: z.string(),
});

export const UidSchema = z.object({
  uid: z.string(),
});

export const SuccessMessageSchema = z.object({
  success: z.string().describe("Admin operation was successful"),
});

export const AdminAuthSchema = z.object({
  uid: z.string(),
  type: z.literal("admin"),
  user: AdminSchema,
});
