import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { MaintenanceStatus, Setting } from "../../prisma/generated";

extendZodWithOpenApi(z);

export const SettingSchema: z.ZodType<Setting> = z
  .object({
    id: z.number(),
    uid: z.string().uuid(),

    // Site Information
    siteName: z.string(),
    siteDescription: z.string().nullable(),
    adminEmail: z.string().email().nullable(),
    logoUrl: z.string().url().nullable(),
    faviconUrl: z.string().url().nullable(),
    defaultCurrency: z.string().length(3), // e.g., USD
    timezone: z.string(),
    defaultLanguage: z.string(),
    dateFormat: z.string(),

    // Maintenance
    maintenanceMode: z.nativeEnum(MaintenanceStatus),
    maintenanceMsg: z.string().nullable(),
    maintenanceStart: z.coerce.date().nullable(),
    maintenanceEnd: z.coerce.date().nullable(),
    allowedIps: z.array(z.string()).nullable(),

    // Rate limits
    requestsPerMinute: z.number(),
    requestsPerHour: z.number(),
    requestsPerDay: z.number(),

    // Login
    maxLoginAttempts: z.number(),
    lockoutDuration: z.number(),

    // Upload
    maxFileSizeMb: z.number(),
    uploadsPerHour: z.number(),
    concurrentUploads: z.number(),

    // Throttling
    progressiveDelays: z.boolean(),
    blockSuspiciousIp: z.boolean(),
    sendEmailAlerts: z.boolean(),
    whitelistedIps: z.array(z.string()).nullable(),

    staleItemThreshold: z.number(),

    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .openapi("Setting");

export const SettingSchemaForUsers = z
  .object({
    // Site Information
    siteName: z.string(),
    siteDescription: z.string().nullable(),
    adminEmail: z.string().email().nullable(),
    logoUrl: z.string().url().nullable(),
    faviconUrl: z.string().url().nullable(),
    defaultCurrency: z.string().length(3), // e.g., USD
    timezone: z.string(),
    defaultLanguage: z.string(),
    dateFormat: z.string(),

    // Maintenance
    maintenanceMode: z.nativeEnum(MaintenanceStatus),
    maintenanceMsg: z.string().nullable(),
  })
  .openapi("Setting");

export const UpdateSettingSchema = z.object({
  // Site Information
  siteName: z.string().optional(),
  siteDescription: z.string().optional(),
  adminEmail: z.string().optional(),
  logoUrl: z.string().optional(),
  faviconUrl: z.string().optional(),
  defaultCurrency: z.string().length(3), // e.g., USD
  timezone: z.string().optional(),
  defaultLanguage: z.string().optional(),
  dateFormat: z.string().optional(),

  // Maintenance
  maintenanceMode: z.nativeEnum(MaintenanceStatus).optional(),
  maintenanceMsg: z.string().optional(),
  maintenanceStart: z.coerce.date().optional(),
  maintenanceEnd: z.coerce.date().optional(),
  allowedIps: z.array(z.string()).optional(),

  // Rate limits
  requestsPerMinute: z.number().optional(),
  requestsPerHour: z.number().optional(),
  requestsPerDay: z.number().optional(),

  // Login
  maxLoginAttempts: z.number().optional(),
  lockoutDuration: z.number().optional(),

  // Upload
  maxFileSizeMb: z.number().optional(),
  uploadsPerHour: z.number().optional(),
  concurrentUploads: z.number().optional(),

  // Throttling
  progressiveDelays: z.boolean().optional(),
  blockSuspiciousIp: z.boolean().optional(),
  sendEmailAlerts: z.boolean().optional(),
  whitelistedIps: z.array(z.string()).optional(),
});
