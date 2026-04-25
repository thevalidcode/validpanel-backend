import { StoreType } from "../../prisma/generated";
import { prisma } from "../config/db.config";
import type {
  AdminResellerStoreListQueryInput,
  ResellerStoreCreateInput,
  ResellerStoreUpdateInput,
} from "../schemas/resellerStore.schema";

function normalizeSourceUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
}

export async function listResellerStores(
  input: {
    type: StoreType;
    page: number;
    limit: number;
    search?: string;
  },
  isInternal: boolean | undefined = undefined,
) {
  const search = input.search?.trim();

  const where = {
    type: input.type,
    isActive: true,
    isInternal: isInternal,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { url: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, stores] = await Promise.all([
    prisma.resellerStore.count({ where }),
    prisma.resellerStore.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      select: {
        uid: true,
        name: true,
        url: true,
        image: true,
        type: true,
        isActive: true,
        storeId: true,
        isInternal: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    stores,
    meta: {
      total,
      page: input.page,
      pages: Math.max(1, Math.ceil(total / input.limit)),
      limit: input.limit,
    },
  };
}

export async function createResellerStore(input: ResellerStoreCreateInput) {
  const normalizedUrl = normalizeSourceUrl(input.url);
  const existing = await prisma.resellerStore.findFirst({
    where: { url: normalizedUrl, type: input.type },
    select: { uid: true },
  });

  if (existing) {
    throw new Error("RESELLER_STORE_ALREADY_EXISTS");
  }

  return prisma.resellerStore.create({
    data: {
      name: input.name,
      url: normalizedUrl,
      image: input.image || null,
      type: input.type,
      isActive: input.isActive,
      isInternal: false,
    },
  });
}

export async function getResellerStoreByUid(uid: string) {
  return prisma.resellerStore.findUnique({
    where: { uid },
    select: {
      uid: true,
      name: true,
      url: true,
      image: true,
      type: true,
      isActive: true,
      isInternal: true,
      storeId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function listAdminResellerStores(
  input: AdminResellerStoreListQueryInput,
) {
  const search = input.search?.trim();

  const where = {
    ...(input.type ? { type: input.type } : {}),
    ...(typeof input.isActive === "boolean"
      ? { isActive: input.isActive }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { url: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, stores] = await Promise.all([
    prisma.resellerStore.count({ where }),
    prisma.resellerStore.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
      select: {
        uid: true,
        name: true,
        url: true,
        image: true,
        type: true,
        isActive: true,
        storeId: true,
        isInternal: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    resellerStores: stores,
    meta: {
      total,
      page: input.page,
      pages: Math.max(1, Math.ceil(total / input.limit)),
      limit: input.limit,
    },
  };
}

export async function updateResellerStore(
  uid: string,
  input: ResellerStoreUpdateInput,
) {
  const existing = await prisma.resellerStore.findUnique({
    where: { uid },
    select: { uid: true },
  });

  if (!existing) {
    throw new Error("RESELLER_STORE_NOT_FOUND");
  }

  const nextUrl = input.url ? normalizeSourceUrl(input.url) : undefined;

  if (nextUrl) {
    const duplicate = await prisma.resellerStore.findFirst({
      where: {
        uid: { not: uid },
        url: nextUrl,
      },
      select: { uid: true },
    });

    if (duplicate) {
      throw new Error("RESELLER_STORE_ALREADY_EXISTS");
    }
  }

  return prisma.resellerStore.update({
    where: { uid },
    data: {
      ...(typeof input.name === "string" ? { name: input.name } : {}),
      ...(typeof nextUrl === "string" ? { url: nextUrl } : {}),
      ...("image" in input ? { image: input.image || null } : {}),
      ...(typeof input.isActive === "boolean"
        ? { isActive: input.isActive }
        : {}),
    },
  });
}

export async function deleteResellerStore(uid: string) {
  const existing = await prisma.resellerStore.findUnique({
    where: { uid },
    select: {
      uid: true,
      isInternal: true,
    },
  });

  if (!existing) {
    throw new Error("RESELLER_STORE_NOT_FOUND");
  }

  if (existing.isInternal) {
    throw new Error("INTERNAL_RESELLER_STORE_DELETE_FORBIDDEN");
  }

  await prisma.resellerStore.delete({ where: { uid } });
}

export async function upsertInternalResellerStore(input: {
  name: string;
  url: string;
  type: "SOCIAL" | "SHOP" | "DIGITAL";
  image?: string | null;
}) {
  const normalizedUrl = normalizeSourceUrl(input.url);

  return prisma.resellerStore.upsert({
    where: { url: normalizedUrl },
    update: {
      name: input.name,
      image: input.image || null,
      type: input.type,
      isInternal: true,
    },
    create: {
      name: input.name,
      url: normalizedUrl,
      image: input.image || null,
      type: input.type,
      isInternal: true,
      isActive: true,
    },
  });
}

export async function deleteInternalResellerStore(url: string) {
  const normalizedUrl = normalizeSourceUrl(url);
  await prisma.resellerStore.deleteMany({ where: { url: normalizedUrl } });
}
