import { Store, User } from "../../../prisma/generated";
import {
  callInternalAPIForAdmins,
  callInternalAPIForUsers,
} from "../../utils/internalApi";
import {
  deleteInternalResellerStore,
  upsertInternalResellerStore,
} from "../resellerStore.service";

export async function CreateStore(user: User, store: Store) {
  await upsertInternalResellerStore({
    name: store.name,
    url: `api.${store.uid}/v2`,
    type: store.type,
    image: store.logoUrl || null,
  });

  const response = await callInternalAPIForAdmins(
    "POST",
    "/stores",
    user.uid,
    store.type,
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
      resellingEnabled: Boolean((store as any).resellingEnabled),
    },
  );
  return response;
}

export async function DeleteStore(user: User, store: Store) {
  await deleteInternalResellerStore(`api.${store.uid}/v2`);

  const response = await callInternalAPIForAdmins(
    "DELETE",
    `/stores/${store.uid}`,
    user.uid,
    store.type,
  );
  return response;
}

export async function UpdateStore(user: User, store: Store) {
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
