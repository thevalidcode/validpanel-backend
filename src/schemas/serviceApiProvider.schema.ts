import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import {
  ServiceApiProvider,
  ServiceProviderStatus,
} from "../../prisma/generated";

extendZodWithOpenApi(z);

export const ServiceApiProviderSchema: z.ZodType<ServiceApiProvider> = z
  .object({
    id: z.number(),
    name: z.string(),
    uid: z.string().uuid(),
    url: z.string().url(),
    image: z.string().url(),
    updatedAt: z.coerce.date(),
    createdAt: z.coerce.date(),
    status: z.nativeEnum(ServiceProviderStatus),
  })
  .openapi("ServiceApiProvider");

export const CreateServiceProviderSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  image: z.string().url().optional(),
});

export const UpdateServiceProviderSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  image: z.string().url().optional(),
});

export const UpdateServiceProviderStatusSchema = z.object({
  status: z.nativeEnum(ServiceProviderStatus),
});

export const GetServiceProviderByUidSchema = z.object({
  uid: z.string().uuid(),
});

export const DeleteServiceProviderSchema = z.object({
  uid: z.string().uuid(),
});

export const GetAllServiceProvidersQuerySchema = z.object({
  status: z.nativeEnum(ServiceProviderStatus).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
});
