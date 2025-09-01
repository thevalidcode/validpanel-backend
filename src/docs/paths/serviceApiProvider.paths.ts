import { registry } from "../components/registry";
import {
  CreateServiceProviderSchema,
  UpdateServiceProviderSchema,
  UpdateServiceProviderStatusSchema,
  GetServiceProviderByUidSchema,
  GetAllServiceProvidersQuerySchema,
} from "../../schemas/serviceApiProvider.schema";
import {
  CreateServiceProviderResponse,
  GetAllServiceProvidersResponse,
  GetServiceProviderByUidResponse,
  UpdateServiceProviderResponse,
  UpdateServiceProviderStatusResponse,
  DeleteServiceProviderResponse,
} from "../responses/serviceApiProvider.response";
import { BadRequest, ServerError } from "../responses/common.response";

/**
 * =========================
 * SERVICE API PROVIDER ROUTES
 * =========================
 */

// Create new provider
registry.registerPath({
  method: "post",
  path: "/service-api-providers",
  summary: "Create a new Service API Provider",
  tags: ["Service API Providers"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateServiceProviderSchema,
        },
      },
    },
  },
  responses: {
    201: CreateServiceProviderResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Get all providers (filters, pagination)
registry.registerPath({
  method: "get",
  path: "/service-api-providers",
  summary: "Get all Service API Providers with filters & pagination",
  tags: ["Service API Providers"],
  request: {
    query: GetAllServiceProvidersQuerySchema,
  },
  responses: {
    200: GetAllServiceProvidersResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Get provider by UID
registry.registerPath({
  method: "get",
  path: "/service-api-providers/{uid}",
  summary: "Get a Service API Provider by UID",
  tags: ["Service API Providers"],
  request: {
    params: GetServiceProviderByUidSchema,
  },
  responses: {
    200: GetServiceProviderByUidResponse,
    400: BadRequest,
    404: {
      description: "Service API Provider not found",
    },
    500: ServerError,
  },
});

// Update provider details
registry.registerPath({
  method: "put",
  path: "/service-api-providers/{uid}",
  summary: "Update Service API Provider details",
  tags: ["Service API Providers"],
  request: {
    params: GetServiceProviderByUidSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateServiceProviderSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateServiceProviderResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Update provider status
registry.registerPath({
  method: "patch",
  path: "/service-api-providers/{uid}/status",
  summary: "Update Service API Provider status",
  tags: ["Service API Providers"],
  request: {
    params: GetServiceProviderByUidSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateServiceProviderStatusSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateServiceProviderStatusResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// Delete provider
registry.registerPath({
  method: "delete",
  path: "/service-api-providers/{uid}",
  summary: "Delete a Service API Provider",
  tags: ["Service API Providers"],
  request: {
    params: GetServiceProviderByUidSchema,
  },
  responses: {
    200: DeleteServiceProviderResponse,
    400: BadRequest,
    500: ServerError,
  },
});
