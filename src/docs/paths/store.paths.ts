import { registry } from "../components/registry";
import {
  CreateStoreSchema,
  UpdateStoreSchema,
  StoreUidSchema,
  AdminActionSchema,
} from "../../schemas/store.schema";
import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";
import {
  GetStoresResponse,
  GetStoreByUidResponse,
  CreateStoreResponse,
  UpdateStoreResponse,
  DeleteStoreResponse,
} from "../responses/store.response";

// GET /store
registry.registerPath({
  method: "get",
  path: "/stores",
  summary: "Admin: Get all active stores",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  responses: {
    200: GetStoresResponse,
    500: ServerError,
  },
});

// GET /stores/:uid
registry.registerPath({
  method: "get",
  path: "/stores/{uid}",
  summary: "Get store by UID",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  request: {
    params: StoreUidSchema,
  },
  responses: {
    200: GetStoreByUidResponse,
    400: BadRequest,

    500: ServerError,
  },
});

// POST /store
registry.registerPath({
  method: "post",
  path: "/stores",
  summary: "Create a new store",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateStoreSchema,
        },
      },
    },
  },
  responses: {
    201: CreateStoreResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// PUT /stores/{uid}
registry.registerPath({
  method: "put",
  path: "/stores/{uid}",
  summary: "Update store details",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  request: {
    params: StoreUidSchema,
    body: {
      content: {
        "application/json": {
          schema: UpdateStoreSchema,
        },
      },
    },
  },
  responses: {
    200: UpdateStoreResponse,
    400: BadRequest,
    403: Forbidden,

    500: ServerError,
  },
});

// DELETE /stores/{uid}
registry.registerPath({
  method: "delete",
  path: "/stores/{uid}",
  summary: "Delete a store",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  request: {
    params: StoreUidSchema,
  },
  responses: {
    200: DeleteStoreResponse,
    400: BadRequest,
    403: Forbidden,

    500: ServerError,
  },
});

// GET /stores/my/store
registry.registerPath({
  method: "get",
  path: "/stores/my/store",
  summary: "Get all stores owned by the authenticated user",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  responses: {
    200: GetStoresResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// ========== ADMIN ROUTES ==========

// GET /stores/admin/all
registry.registerPath({
  method: "get",
  path: "/stores/admin/all",
  summary: "Admin: Get all stores",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  responses: {
    200: GetStoresResponse,
    500: ServerError,
  },
});

// GET /stores/admin/{uid}
registry.registerPath({
  method: "get",
  path: "/stores/admin/{uid}",
  summary: "Admin: Get store by UID",
  tags: ["Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    params: StoreUidSchema,
  },
  responses: {
    200: GetStoreByUidResponse,
    400: BadRequest,

    500: ServerError,
  },
});

// PUT /stores/admin/{uid}/approve
registry.registerPath({
  method: "put",
  path: "/stores/admin/{uid}/approve",
  summary: "Admin: Approve store",
  tags: ["Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    params: AdminActionSchema,
  },
  responses: {
    200: UpdateStoreResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// PUT /stores/admin/{uid}/suspend
registry.registerPath({
  method: "put",
  path: "/stores/admin/{uid}/suspend",
  summary: "Admin: Suspend store",
  tags: ["Stores"],
  security: [{ CookieAuth: [] }],
  request: {
    params: AdminActionSchema,
  },
  responses: {
    200: UpdateStoreResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// DELETE /stores/admin/{uid}
registry.registerPath({
  method: "delete",
  path: "/stores/admin/{uid}",
  summary: "Admin: Delete store",
  security: [{ CookieAuth: [] }],
  tags: ["Stores"],
  request: {
    params: AdminActionSchema,
  },
  responses: {
    200: DeleteStoreResponse,
    400: BadRequest,
    500: ServerError,
  },
});
