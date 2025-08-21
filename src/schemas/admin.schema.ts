import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { Admin, AdminRole, AdminStatus } from "../../prisma/generated";

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
    status: z.nativeEnum(AdminStatus),
    role: z.nativeEnum(AdminRole),
  })
  .openapi("Admin");

export const AuthenticateAdminResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  role: z.nativeEnum(AdminRole),
  user: z.object({
    id: z.coerce.number().describe("Admin id"),
    email: z.string().email().describe("Admin email"),
    fullName: z.string().describe("Admin full name"),
  }),
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
  fullName: z.string(),
  password: z.string().min(6),
});

export const updateAdminSchema = z.object({
  uid: z.string(),
  username: z.string().optional(),
  fullName: z.string().optional(),
});