import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  OnboardingStep,
  StoreType,
  User,
  UserStatus,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/library";
import { AdminSchema } from "./admin.schema";

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
    onboardingStep: z.nativeEnum(OnboardingStep),
  })
  .openapi("User");

export const AuthSchema = z.object({
  uid: z.string().uuid(),
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
    spent: z.custom<Decimal>(),
    balance: z.custom<Decimal>(),
    lastSeen: z.coerce.date(),
  })
  .openapi("UserPublic");

export const AuthenticateUserResponseSchema = z.object({
  success: z.literal("Logged in successfully"),
  user: UserSchema,
});

export const GoogleAuthRequestSchema = z
  .object({
    id_token: z.string().describe("Google OAuth ID token"),
  })
  .openapi("GoogleAuthResponse");

export const VerifySessionResponseSchema = z.object({
  email: z.string().email().describe("User email"),
});

export const AuthenticateUserSchema = z.object({
  email: z.string().email().describe("User email"),
  password: z.string().describe("User password"),
});

export const createUserRequestSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(4),
  password: z.string().min(6),
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

export const selectPlanSchema = z.object({
  planId: z.number(),
});

export const paymentSchema = z.object({
  subscriptionId: z.number(),
  paymentMethodId: z.string(),
});

export const setupStoreSchema = z.object({
  subscriptionId: z.number(),
  type: z.nativeEnum(StoreType),
  name: z.string().min(4),
  domain: z.string(),
  logoUrl: z.string().url().optional(),
  color: z.string().optional(),
});
