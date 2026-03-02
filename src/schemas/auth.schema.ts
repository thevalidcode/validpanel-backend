import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const RoleEnum = z.enum(["USER", "ADMIN"]);
export type Role = z.infer<typeof RoleEnum>;

export const RedirectToGoogleQuerySchema = z.object({
  redirect: z.string().url(),
  role: RoleEnum.optional().default("USER"),
});

export const GoogleCallbackQuerySchema = z.object({
  code: z.coerce.string(),
  state: z.coerce.string(),
});

export const internalTokenPayloadSchema = z.object({
  iss: z.enum(["social-media-store", "shop"]), // who issued the token
  uid: z.string().uuid(),
  storeId: z.number(),
});
