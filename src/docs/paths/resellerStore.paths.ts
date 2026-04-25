import { registry } from "../components/registry";
import {
  AdminResellerStoreListQuerySchema,
  ResellerStoreCreateSchema,
  ResellerStoreUidParamsSchema,
  ResellerStoreUpdateSchema,
} from "../../schemas/resellerStore.schema";
import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";
import {
  ResellerStoreListResponse,
  ResellerStoreObjectResponse,
  ResellerStoreWriteResponse,
} from "../responses/resellerStore.response";

registry.registerPath({
  method: "get",
  path: "/reseller-stores/admin",
  summary: "List reseller stores (admin)",
  tags: ["Reseller Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    query: AdminResellerStoreListQuerySchema,
  },
  responses: {
    200: ResellerStoreListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/reseller-stores/admin/{uid}",
  summary: "Get reseller store by uid (admin)",
  tags: ["Reseller Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ResellerStoreUidParamsSchema,
  },
  responses: {
    200: ResellerStoreObjectResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/reseller-stores/admin",
  summary: "Create reseller store (admin)",
  tags: ["Reseller Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResellerStoreCreateSchema,
        },
      },
    },
  },
  responses: {
    200: ResellerStoreWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "patch",
  path: "/reseller-stores/admin/{uid}",
  summary: "Update reseller store (admin)",
  tags: ["Reseller Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ResellerStoreUidParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: ResellerStoreUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: ResellerStoreWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "delete",
  path: "/reseller-stores/admin/{uid}",
  summary: "Delete reseller store (admin)",
  tags: ["Reseller Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    params: ResellerStoreUidParamsSchema,
  },
  responses: {
    200: ResellerStoreWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
