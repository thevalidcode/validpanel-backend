import { z } from "zod";
import { KnowledgeBaseStatus } from "../../../prisma/generated";

const KnowledgeBaseAuthorSchema = z.object({
  uid: z.string(),
  fullName: z.string(),
});

const KnowledgeBaseObjectSchema = z.object({
  uid: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string().nullable().optional(),
  contentHtml: z.string(),
  coverImage: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()),
  status: z.nativeEnum(KnowledgeBaseStatus),
  isFeatured: z.boolean(),
  position: z.number(),
  publishedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  author: KnowledgeBaseAuthorSchema.nullable().optional(),
});

const KnowledgeBasePublicObjectSchema = z.object({
  uid: z.string(),
  title: z.string(),
  slug: z.string(),
  summary: z.string().nullable().optional(),
  contentHtml: z.string().optional(),
  coverImage: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()),
  status: z.nativeEnum(KnowledgeBaseStatus),
  isFeatured: z.boolean(),
  publishedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const KnowledgeBaseAdminListResponse = {
  description: "Admin knowledge base list",
  content: {
    "application/json": {
      schema: z.object({
        knowledgeBase: z.array(KnowledgeBaseObjectSchema),
        meta: z.object({
          total: z.number(),
          page: z.number(),
          pages: z.number(),
          limit: z.number(),
        }),
      }),
    },
  },
};

export const KnowledgeBasePublicListResponse = {
  description: "Public knowledge base list",
  content: {
    "application/json": {
      schema: z.object({
        knowledgeBase: z.array(KnowledgeBasePublicObjectSchema),
        meta: z.object({
          total: z.number(),
          page: z.number(),
          pages: z.number(),
          limit: z.number(),
        }),
      }),
    },
  },
};

export const KnowledgeBaseObjectResponse = {
  description: "Knowledge base article object",
  content: {
    "application/json": {
      schema: z.object({
        article: KnowledgeBaseObjectSchema,
      }),
    },
  },
};

export const KnowledgeBasePublicObjectResponse = {
  description: "Public knowledge base article object",
  content: {
    "application/json": {
      schema: z.object({
        article: KnowledgeBasePublicObjectSchema,
      }),
    },
  },
};

export const KnowledgeBaseWriteResponse = {
  description: "Knowledge base write response",
  content: {
    "application/json": {
      schema: z.object({
        success: z.boolean(),
        article: KnowledgeBaseObjectSchema.optional(),
      }),
    },
  },
};
