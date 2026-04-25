import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { KnowledgeBaseStatus } from "../../prisma/generated";

extendZodWithOpenApi(z);

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const KnowledgeBaseUidParamsSchema = z.object({
  uid: z.string().min(1),
});

export const KnowledgeBaseSlugParamsSchema = z.object({
  slug: z.string().min(1),
});

export const AdminKnowledgeBaseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.nativeEnum(KnowledgeBaseStatus).optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const PublicKnowledgeBaseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  category: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const KnowledgeBaseCreateSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(slugRegex).optional(),
  summary: z.string().max(3000).optional().nullable(),
  contentHtml: z.string().min(10),
  coverImage: z.string().url().optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  tags: z.array(z.string().max(60)).max(30).default([]),
  status: z.nativeEnum(KnowledgeBaseStatus).default(KnowledgeBaseStatus.DRAFT),
  isFeatured: z.boolean().default(false),
  position: z.coerce.number().int().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
});

export const KnowledgeBaseUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(3).regex(slugRegex).optional(),
  summary: z.string().max(3000).optional().nullable(),
  contentHtml: z.string().min(10).optional(),
  coverImage: z.string().url().optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  tags: z.array(z.string().max(60)).max(30).optional(),
  status: z.nativeEnum(KnowledgeBaseStatus).optional(),
  isFeatured: z.boolean().optional(),
  position: z.coerce.number().int().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
});

export type KnowledgeBaseCreateInput = z.infer<
  typeof KnowledgeBaseCreateSchema
>;
export type KnowledgeBaseUpdateInput = z.infer<
  typeof KnowledgeBaseUpdateSchema
>;
export type AdminKnowledgeBaseListQueryInput = z.infer<
  typeof AdminKnowledgeBaseListQuerySchema
>;
export type PublicKnowledgeBaseListQueryInput = z.infer<
  typeof PublicKnowledgeBaseListQuerySchema
>;
