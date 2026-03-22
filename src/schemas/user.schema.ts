import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  OnboardingStep,
  StoreType,
  User,
  UserStatus,
} from "../../prisma/generated";
import { Decimal } from "@prisma/client/runtime/client";

extendZodWithOpenApi(z);

export const UserSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    uid: z.string(),
    phoneNumber: z.string().nullable(),
    apiKey: z.string(),
    ref: z.number().nullable(),
    refCode: z.number(),
    image: z.string().url().nullable(),
    currency: z.string().toUpperCase().length(3),
    fullName: z.string(),
    balance: z.custom<Decimal>(),
    lastSeen: z.coerce.date(),
    timestamp: z.coerce.date(),
    updatedAt: z.coerce.date(),
    hasSeenTour: z.boolean(),
    status: z.nativeEnum(UserStatus),
    onboardingStep: z.nativeEnum(OnboardingStep),
    referralSource: z.string().nullable().optional(),
    marketingData: z.record(z.any()).nullable().optional(),
  })
  .openapi("User");

export const UserPublicSchema = z
  .object({
    id: z.number(),
    ref: z.number().nullable(),
    refCode: z.number(),
    email: z.string().email(),
    uid: z.string().uuid(),
    fullName: z.string(),
    phoneNumber: z.string().nullable(),
    image: z.string().nullable(),
    lastSeen: z.coerce.date(),
    timestamp: z.coerce.date(),
    currency: z.string().toUpperCase().length(3),
    status: z.nativeEnum(UserStatus),
    balance: z.coerce.string(),
    onboardingStep: z.nativeEnum(OnboardingStep),
    referralSource: z.string().nullable().optional(),
    marketingData: z.record(z.any()).nullable().optional(),
  })
  .openapi("UserPublic");

export type UserPublic = z.infer<typeof UserPublicSchema>;

export const AuthSchema = z.object({
  uid: z.string().uuid(),
  type: z.literal("user"),
  user: UserPublicSchema,
});

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
  referralSource: z.string().optional().describe("How did you hear about us"),
  marketingData: z
    .record(z.any())
    .optional()
    .describe("Additional marketing data (UTM params, campaigns, etc.)"),
});

export const updateUserSchema = z
  .object({
    username: z.string().optional(),
    phoneNumber: z.string().optional(),
    image: z.string().optional(),
    fullName: z.string().optional(),
    referralSource: z.string().optional(),
    marketingData: z.record(z.any()).optional(),
  })
  .strict();

export const tokenPayloadSchema = z.object({
  email: z.string().email(),
  apiKey: z.string(),
  uid: z.string(),
});

export const paymentSchema = z.object({
  subscriptionId: z.number(),
  paymentMethodId: z.string(),
});

export const setupStoreSchema = z.object({
  subscriptionId: z.number(),
  type: z.nativeEnum(StoreType),
  name: z.string().min(2, "Store name must be at least 2 characters long"),
  domain: z.string(),
  logoUrl: z.string().optional(),
  color: z.string().optional(),
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
  referralSource: z.string().optional().nullable(),
  marketingData: z.record(z.string(), z.any()).optional().nullable(),
});

export const UidsSchema = z.object({
  uids: z.array(z.string().uuid()),
});
