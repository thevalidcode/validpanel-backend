import { z } from "zod";
import { ServiceApiProviderSchema } from "../../schemas/serviceApiProvider.schema";

export const CreateServiceProviderResponse = {
  description: "Service API Provider created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: ServiceApiProviderSchema,
      }),
    },
  },
};

export const GetAllServiceProvidersResponse = {
  description: "List of Service API Providers",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        providers: z.array(ServiceApiProviderSchema),
        pagination: z.object({
          total: z.number(),
          page: z.number(),
          limit: z.number(),
        }),
      }),
    },
  },
};

export const GetServiceProviderByUidResponse = {
  description: "Service API Provider details",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: ServiceApiProviderSchema,
      }),
    },
  },
};

export const UpdateServiceProviderResponse = {
  description: "Service API Provider updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: ServiceApiProviderSchema,
      }),
    },
  },
};

export const UpdateServiceProviderStatusResponse = {
  description: "Service API Provider status updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        data: ServiceApiProviderSchema,
      }),
    },
  },
};

export const DeleteServiceProviderResponse = {
  description: "Service API Provider deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        message: z.string(),
      }),
    },
  },
};
