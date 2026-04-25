import { registry } from "../components/registry";
import {
  ProviderIdParamsSchema,
  SourceStoresQuerySchema,
  SupplierIdParamsSchema,
  StartResellingSchema,
  SyncResellerStoreParamsSchema,
  SyncResellerStoreSchema,
} from "../../schemas/reseller.schema";
import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";
import {
  ResellerSourceProductsResponse,
  ResellerSourceServicesResponse,
  ResellerSourceStoresResponse,
  StartResellingResponse,
  SyncResellingResponse,
} from "../responses/reseller.response";

registry.registerPath({
  method: "get",
  path: "/reseller/sources",
  summary: "Get source suppliers/providers for reseller discovery",
  tags: ["Reseller"],
  request: {
    query: SourceStoresQuerySchema,
  },
  responses: {
    200: ResellerSourceStoresResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/reseller/shop/{supplierId}/products",
  summary: "Get source supplier products for preview",
  tags: ["Reseller"],
  request: {
    params: SupplierIdParamsSchema,
  },
  responses: {
    200: ResellerSourceProductsResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/reseller/smm/{providerId}/services",
  summary: "Get source provider services for preview",
  tags: ["Reseller"],
  request: {
    params: ProviderIdParamsSchema,
  },
  responses: {
    200: ResellerSourceServicesResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/reseller/start",
  summary: "Create or initialize a reseller store and import source catalog",
  tags: ["Reseller"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: StartResellingSchema,
        },
      },
    },
  },
  responses: {
    201: StartResellingResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/reseller/{targetStoreUid}/sync",
  summary: "Synchronize reseller catalog from a supplier/provider",
  tags: ["Reseller"],
  security: [{ CookieAuth: [] }],
  request: {
    params: SyncResellerStoreParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: SyncResellerStoreSchema,
        },
      },
    },
  },
  responses: {
    200: SyncResellingResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
