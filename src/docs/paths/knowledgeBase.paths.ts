import { registry } from "../components/registry";
import {
  AdminKnowledgeBaseListQuerySchema,
  KnowledgeBaseCreateSchema,
  KnowledgeBaseSlugParamsSchema,
  KnowledgeBaseUidParamsSchema,
  KnowledgeBaseUpdateSchema,
  PublicKnowledgeBaseListQuerySchema,
} from "../../schemas/knowledgeBase.schema";
import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";
import {
  KnowledgeBaseAdminListResponse,
  KnowledgeBaseObjectResponse,
  KnowledgeBasePublicListResponse,
  KnowledgeBasePublicObjectResponse,
  KnowledgeBaseWriteResponse,
} from "../responses/knowledgeBase.response";

registry.registerPath({
  method: "get",
  path: "/knowledge-base",
  summary: "List public knowledge base articles",
  tags: ["Knowledge Base"],
  request: {
    query: PublicKnowledgeBaseListQuerySchema,
  },
  responses: {
    200: KnowledgeBasePublicListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/knowledge-base/{slug}",
  summary: "Get public knowledge base article by slug",
  tags: ["Knowledge Base"],
  request: {
    params: KnowledgeBaseSlugParamsSchema,
  },
  responses: {
    200: KnowledgeBasePublicObjectResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/knowledge-base/admin",
  summary: "List knowledge base articles (admin)",
  tags: ["Knowledge Base"],
  security: [{ CookieAuth: [] }],
  request: {
    query: AdminKnowledgeBaseListQuerySchema,
  },
  responses: {
    200: KnowledgeBaseAdminListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/knowledge-base/admin/{uid}",
  summary: "Get knowledge base article by uid (admin)",
  tags: ["Knowledge Base"],
  security: [{ CookieAuth: [] }],
  request: {
    params: KnowledgeBaseUidParamsSchema,
  },
  responses: {
    200: KnowledgeBaseObjectResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/knowledge-base/admin",
  summary: "Create knowledge base article (admin)",
  tags: ["Knowledge Base"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: KnowledgeBaseCreateSchema,
        },
      },
    },
  },
  responses: {
    201: KnowledgeBaseWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "patch",
  path: "/knowledge-base/admin/{uid}",
  summary: "Update knowledge base article (admin)",
  tags: ["Knowledge Base"],
  security: [{ CookieAuth: [] }],
  request: {
    params: KnowledgeBaseUidParamsSchema,
    body: {
      content: {
        "application/json": {
          schema: KnowledgeBaseUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: KnowledgeBaseWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "delete",
  path: "/knowledge-base/admin/{uid}",
  summary: "Delete knowledge base article (admin)",
  tags: ["Knowledge Base"],
  security: [{ CookieAuth: [] }],
  request: {
    params: KnowledgeBaseUidParamsSchema,
  },
  responses: {
    200: KnowledgeBaseWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
