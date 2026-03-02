import { Store, User } from "../../../prisma/generated";
import { env } from "../../config/env.config";
import { callInternalAPIForUsers } from "../../utils/internalApi";

export async function CreateStore(user: User, store: Store) {
  if (env.NODE_ENV !== "production") return;
  const response = await callInternalAPIForUsers(
    "POST",
    "/stores",
    user.uid,
    store.storeId,
    {
      storeId: store.storeId,
      name: store.name,
      storeDomain: store.uid,
      description: store.description,
      logoUrl: store.logoUrl,
      faviconUrl: store.logoUrl,
      adminId: user.id,
      adminUid: user.uid,
      adminImage: user.image,
      adminEmail: user.email,
      fullName: user.fullName,
    },
  );
  return response;
}

export async function DeleteStore(user: User, store: Store) {
  if (env.NODE_ENV !== "production") return;
  const response = await callInternalAPIForUsers(
    "DELETE",
    `/stores/${store.uid}`,
    user.uid,
    store.storeId,
  );
  return response;
}

export async function UpdateStore(user: User, store: Store) {
  if (env.NODE_ENV !== "production") return;
  const response = await callInternalAPIForUsers(
    "PATCH",
    `/stores/${store.uid}`,
    user.uid,
    store.storeId,
    {
      storeName: store.name,
      storeDescription: store.description,
      logoUrl: store.logoUrl,
      faviconUrl: store.logoUrl,
      status: store.status,
    },
  );
  return response;
}
