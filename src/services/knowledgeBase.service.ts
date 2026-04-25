import { prisma } from "../config/db.config";
import type {
  AdminKnowledgeBaseListQueryInput,
  KnowledgeBaseCreateInput,
  KnowledgeBaseUpdateInput,
  PublicKnowledgeBaseListQueryInput,
} from "../schemas/knowledgeBase.schema";

function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function computePublishedAt(
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  publishedAt?: Date | null,
) {
  if (status === "PUBLISHED") {
    return publishedAt ?? new Date();
  }

  if (status === "DRAFT" || status === "ARCHIVED") {
    return null;
  }

  return publishedAt;
}

export async function listAdminKnowledgeBase(
  input: AdminKnowledgeBaseListQueryInput,
) {
  const search = input.search?.trim();
  const category = input.category?.trim();

  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(typeof input.isFeatured === "boolean"
      ? { isFeatured: input.isFeatured }
      : {}),
    ...(category
      ? { category: { equals: category, mode: "insensitive" as const } }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { summary: { contains: search, mode: "insensitive" as const } },
            { contentHtml: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
            { tags: { hasSome: [search] } },
          ],
        }
      : {}),
  };

  const [total, knowledgeBase] = await Promise.all([
    prisma.knowledgeBase.count({ where }),
    prisma.knowledgeBase.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { position: "asc" },
        { createdAt: "desc" },
      ],
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      include: {
        author: {
          select: {
            uid: true,
            fullName: true,
          },
        },
      },
    }),
  ]);

  return {
    knowledgeBase,
    meta: {
      total,
      page: input.page,
      pages: Math.max(1, Math.ceil(total / input.limit)),
      limit: input.limit,
    },
  };
}

export async function listPublicKnowledgeBase(
  input: PublicKnowledgeBaseListQueryInput,
) {
  const search = input.search?.trim();
  const category = input.category?.trim();

  const where = {
    status: "PUBLISHED" as const,
    ...(typeof input.isFeatured === "boolean"
      ? { isFeatured: input.isFeatured }
      : {}),
    ...(category
      ? { category: { equals: category, mode: "insensitive" as const } }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { summary: { contains: search, mode: "insensitive" as const } },
            { contentHtml: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
            { tags: { hasSome: [search] } },
          ],
        }
      : {}),
  };

  const [total, knowledgeBase] = await Promise.all([
    prisma.knowledgeBase.count({ where }),
    prisma.knowledgeBase.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      select: {
        uid: true,
        title: true,
        slug: true,
        summary: true,
        coverImage: true,
        category: true,
        tags: true,
        isFeatured: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    knowledgeBase,
    meta: {
      total,
      page: input.page,
      pages: Math.max(1, Math.ceil(total / input.limit)),
      limit: input.limit,
    },
  };
}

export async function getKnowledgeBaseByUid(uid: string) {
  return prisma.knowledgeBase.findUnique({
    where: { uid },
    include: {
      author: {
        select: {
          uid: true,
          fullName: true,
        },
      },
    },
  });
}

export async function getPublicKnowledgeBaseBySlug(slug: string) {
  return prisma.knowledgeBase.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
    },
    select: {
      uid: true,
      title: true,
      slug: true,
      summary: true,
      contentHtml: true,
      coverImage: true,
      category: true,
      tags: true,
      isFeatured: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createKnowledgeBase(
  input: KnowledgeBaseCreateInput,
  adminId: number,
) {
  const slug = normalizeSlug(input.slug || input.title);

  const existing = await prisma.knowledgeBase.findUnique({
    where: { slug },
    select: { uid: true },
  });

  if (existing) {
    throw new Error("KNOWLEDGE_BASE_SLUG_EXISTS");
  }

  return prisma.knowledgeBase.create({
    data: {
      title: input.title.trim(),
      slug,
      summary: input.summary?.trim() || null,
      contentHtml: input.contentHtml,
      coverImage: input.coverImage || null,
      category: input.category?.trim() || null,
      tags: input.tags || [],
      status: input.status,
      isFeatured: input.isFeatured,
      position: input.position,
      publishedAt: computePublishedAt(input.status, input.publishedAt || null),
      authorId: adminId,
    },
    include: {
      author: {
        select: {
          uid: true,
          fullName: true,
        },
      },
    },
  });
}

export async function updateKnowledgeBase(
  uid: string,
  input: KnowledgeBaseUpdateInput,
) {
  const existing = await prisma.knowledgeBase.findUnique({
    where: { uid },
    select: {
      uid: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    throw new Error("KNOWLEDGE_BASE_NOT_FOUND");
  }

  const nextSlug = input.slug ? normalizeSlug(input.slug) : undefined;

  if (nextSlug) {
    const duplicate = await prisma.knowledgeBase.findFirst({
      where: {
        uid: { not: uid },
        slug: nextSlug,
      },
      select: { uid: true },
    });

    if (duplicate) {
      throw new Error("KNOWLEDGE_BASE_SLUG_EXISTS");
    }
  }

  return prisma.knowledgeBase.update({
    where: { uid },
    data: {
      ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
      ...(typeof nextSlug === "string" ? { slug: nextSlug } : {}),
      ...("summary" in input ? { summary: input.summary?.trim() || null } : {}),
      ...(typeof input.contentHtml === "string"
        ? { contentHtml: input.contentHtml }
        : {}),
      ...("coverImage" in input
        ? { coverImage: input.coverImage || null }
        : {}),
      ...("category" in input
        ? { category: input.category?.trim() || null }
        : {}),
      ...(Array.isArray(input.tags) ? { tags: input.tags } : {}),
      ...(typeof input.isFeatured === "boolean"
        ? { isFeatured: input.isFeatured }
        : {}),
      ...(typeof input.position === "number"
        ? { position: input.position }
        : {}),
      ...(typeof input.status === "string" || "publishedAt" in input
        ? {
            ...(typeof input.status === "string"
              ? { status: input.status }
              : {}),
            publishedAt: computePublishedAt(
              input.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
              "publishedAt" in input
                ? (input.publishedAt ?? null)
                : existing.publishedAt,
            ),
          }
        : {}),
    },
    include: {
      author: {
        select: {
          uid: true,
          fullName: true,
        },
      },
    },
  });
}

export async function deleteKnowledgeBase(uid: string) {
  const existing = await prisma.knowledgeBase.findUnique({
    where: { uid },
    select: { uid: true },
  });

  if (!existing) {
    throw new Error("KNOWLEDGE_BASE_NOT_FOUND");
  }

  await prisma.knowledgeBase.delete({ where: { uid } });
}
