import axios from "axios";
import { env } from "../config/env.config";
import { prisma } from "../config/db.config";
import { AuthSchema } from "../schemas/user.schema";
import type { StartResellingInput } from "../schemas/reseller.schema";
import { callInternalAPIForUsers } from "../utils/internalApi";
import { listResellerStores } from "./resellerStore.service";
import { StoreType } from "../../prisma/generated";

function getSelectedSourceId(input: {
  sourceType: StoreType;
  supplierId?: string;
  providerId?: string;
}): string {
  if (input.sourceType === "SHOP") {
    if (!input.supplierId) {
      throw new Error("SUPPLIER_NOT_FOUND");
    }
    return input.supplierId;
  }

  if (!input.providerId) {
    throw new Error("PROVIDER_NOT_FOUND");
  }

  return input.providerId;
}

async function assertResellingFeatureEnabled(userId: number): Promise<void> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    throw new Error("ACTIVE_SUBSCRIPTION_REQUIRED");
  }

  if (subscription.expiresAt && subscription.expiresAt < new Date()) {
    throw new Error("SUBSCRIPTION_EXPIRED");
  }

  const features = (subscription.plan.features || {}) as Record<
    string,
    unknown
  >;
  if (!features.reselling) {
    throw new Error("RESELLING_FEATURE_DISABLED");
  }
}

async function resolveTargetStore(
  user: {
    id: number;
    uid: string;
    email: string;
    fullName: string;
    image: string | null;
  },
  input: StartResellingInput,
) {
  if (!input.targetStoreUid) {
    throw new Error("TARGET_STORE_REQUIRED");
  }

  const expectedStoreType = input.sourceType === "SOCIAL" ? "SOCIAL" : "SHOP";

  const existing = await prisma.store.findFirst({
    where: {
      uid: input.targetStoreUid,
      ownerId: user.id,
      type: expectedStoreType,
    },
  });

  if (!existing) {
    throw new Error("TARGET_STORE_NOT_FOUND");
  }

  return existing;
}

async function assertNotResellingFromSameStore(input: {
  sourceUid: string;
  sourceType: StoreType;
  targetStoreId: number;
}) {
  const source = await prisma.resellerStore.findFirst({
    where: {
      uid: input.sourceUid,
      type: input.sourceType,
      isActive: true,
    },
    select: {
      storeId: true,
    },
  });

  if (!source) {
    throw new Error(
      input.sourceType === "SHOP" ? "SUPPLIER_NOT_FOUND" : "PROVIDER_NOT_FOUND",
    );
  }

  if (source.storeId && source.storeId === input.targetStoreId) {
    throw new Error("SELF_RESELLING_NOT_ALLOWED");
  }
}

export async function getResellerSourceStores(input: {
  page: number;
  limit: number;
  search?: string;
  sourceType: StoreType;
}) {
  const response = await listResellerStores({
    type: input.sourceType,
    page: input.page,
    limit: input.limit,
    search: input.search,
  }, true);

  return {
    sources: response.stores.map((store) => ({
      id: store.uid,
      name: store.name,
      type: input.sourceType,
      image: store.image || "",
      description: store.url,
      itemCount: 0,
    })),
    meta: response.meta,
  };
}

export async function getResellerSourceProducts(supplierId: string) {
  const response = await axios.get(
    `${env.SHOP_BACKEND_URL}/v1/reseller/shop/${supplierId}/products`,
    {
      headers: { Host: "localhost:3000" },
    },
  );
  return response.data;
}

export async function getResellerSourceServices(providerId: string) {
  const response = await axios.get(
    `${env.SOCIAL_MEDIA_STORE_BACKEND_URL}/v1/reseller/smm/${providerId}/services`,
    {
      headers: { Host: "localhost:3000" },
    },
  );
  return response.data;
}

export async function startReselling(
  reqAuth: unknown,
  input: StartResellingInput,
) {
  const authParsed = AuthSchema.safeParse(reqAuth);
  if (!authParsed.success) {
    throw new Error("UNAUTHORIZED");
  }

  const { user } = authParsed.data;

  await assertResellingFeatureEnabled(user.id);

  const sourceId = getSelectedSourceId(input);
  const targetStore = await resolveTargetStore(user, input);

  await assertNotResellingFromSameStore({
    sourceUid: sourceId,
    sourceType: input.sourceType,
    targetStoreId: targetStore.storeId,
  });

  if (input.sourceType === "SHOP") {
    await getResellerSourceProducts(sourceId);
  } else {
    await getResellerSourceServices(sourceId);
  }

  const importEndpoint =
    input.sourceType === "SOCIAL"
      ? "/reseller/import-services"
      : "/suppliers/import-products";

  const payload =
    input.sourceType === "SOCIAL"
      ? {
          providerId: sourceId,
          marginType: input.marginType,
          marginValue: input.marginValue,
          user: {
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            username: user.email.split("@")[0],
            image: user.image,
            uid: user.uid,
          },
        }
      : {
          supplierId: sourceId,
          marginType: input.marginType,
          marginValue: input.marginValue,
          user: {
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            username: user.email.split("@")[0],
            image: user.image,
            uid: user.uid,
          },
        };

  const importResult = await callInternalAPIForUsers(
    "POST",
    importEndpoint,
    user.uid,
    targetStore.storeId,
    payload,
  );

  return {
    targetStore,
    importResult,
  };
}

export async function syncResellerStore(
  reqAuth: unknown,
  targetStoreUid: string,
  input: {
    supplierId?: string;
    providerId?: string;
    sourceType: StoreType;
    marginType: "percentage" | "fixed";
    marginValue: number;
  },
) {
  const authParsed = AuthSchema.safeParse(reqAuth);
  if (!authParsed.success) {
    throw new Error("UNAUTHORIZED");
  }

  const { user } = authParsed.data;

  await assertResellingFeatureEnabled(user.id);

  const sourceId = getSelectedSourceId(input);
  const expectedStoreType = input.sourceType === "SOCIAL" ? "SOCIAL" : "SHOP";

  const targetStore = await prisma.store.findFirst({
    where: {
      uid: targetStoreUid,
      ownerId: user.id,
      type: expectedStoreType,
    },
  });

  if (!targetStore) {
    throw new Error("TARGET_STORE_NOT_FOUND");
  }

  await assertNotResellingFromSameStore({
    sourceUid: sourceId,
    sourceType: input.sourceType,
    targetStoreId: targetStore.storeId,
  });

  if (input.sourceType === "SHOP") {
    await getResellerSourceProducts(sourceId);
  } else {
    await getResellerSourceServices(sourceId);
  }

  const syncEndpoint =
    input.sourceType === "SOCIAL"
      ? "/reseller/sync-services"
      : "/suppliers/sync-products";

  const payload =
    input.sourceType === "SHOP"
      ? {
          providerId: sourceId,
          marginType: input.marginType,
          marginValue: input.marginValue,
          user: {
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            username: user.email.split("@")[0],
            image: user.image,
            uid: user.uid,
          },
        }
      : {
          supplierId: sourceId,
          marginType: input.marginType,
          marginValue: input.marginValue,
          user: {
            email: user.email,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            username: user.email.split("@")[0],
            image: user.image,
            uid: user.uid,
          },
        };

  const syncResult = await callInternalAPIForUsers(
    "POST",
    syncEndpoint,
    user.uid,
    targetStore.storeId,
    payload,
  );

  return {
    targetStore,
    syncResult,
  };
}
