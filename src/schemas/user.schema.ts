import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  Admin,
  AdminRole,
  AdminStatus,
  User,
  UserPlan,
  UserStatus,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/library";

extendZodWithOpenApi(z);

export const UserSchema: z.ZodType<User> = z
  .object({
    id: z.number(),
    email: z.string().email(),
    uid: z.string().uuid(),
    apiKey: z.string().uuid(),
    ref: z.number(),
    refCode: z.number(),
    image: z.string().url(),
    password: z.string(),
    currency: z.string().toUpperCase().length(3),
    fullName: z.string(),
    spent: z.custom<Decimal>(),
    balance: z.custom<Decimal>(),
    lastSeen: z.coerce.date(),
    timestamp: z.coerce.date(),
    status: z.nativeEnum(UserStatus),
    plan: z.nativeEnum(UserPlan),
  })
  .openapi("User");

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

export const AuthSchema = z.object({
  email: z.string().email(),
  uid: z.string().uuid(),
  apiKey: z.string(),
  role: z.nativeEnum(UserPlan),
  user: UserSchema || AdminSchema,
});

export const UserPublicSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    fullName: z.string(),
    image: z.string().url(),
    timestamp: z.coerce.date(),
    currency: z.string().toUpperCase().length(3),
    status: z.nativeEnum(UserStatus),
    plan: z.nativeEnum(UserPlan),
    spent: z.custom<Decimal>(),
    balance: z.custom<Decimal>(),
    lastSeen: z.coerce.date(),
  })
  .openapi("UserPublic");

export const AuthenticateUserResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  user: z.object({
    id: z.coerce.number().describe("User id"),
    email: z.string().email().describe("User email"),
    username: z.string().describe("User username"),
  }),
});

export const AdminPublicSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.nativeEnum(UserPlan),
});

export const GoogleAuthRequestSchema = z
  .object({
    id_token: z.string().describe("Google OAuth ID token"),
  })
  .openapi("GoogleAuthResponse");

export const VerifySessionResponseSchema = z.object({
  plan: z.nativeEnum(UserPlan),
});

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email().describe("User email"),
  password: z.string().describe("User password"),
});

export const updateUserSchema = z.object({
  uid: z.string(),
  username: z.string().optional(),
  fullName: z.string().optional(),
});

export const tokenPayloadSchema = z.object({
  email: z.string().email(),
  apiKey: z.string(),
  uid: z.string(),
});
