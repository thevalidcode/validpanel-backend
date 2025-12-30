import {
  Store,
  Subscription,
  SubscriptionPlan,
  User,
} from "../../../prisma/generated";
import { callInternalAPIForUsers } from "../../utils/internalApi";

export async function CreateStore(
  user: User,
  store: Store,
  subscription: Subscription & { plan: SubscriptionPlan }
) {
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
      planId: subscription.planId,
      features: subscription.plan.features,
      adminId: user.id,
      adminUid: user.uid,
      adminImage: user.image,
      adminEmail: user.email,
      adminPassword: user.password,
      fullName: user.fullName,
    }
  );
  return response;
}

export async function DeleteStore(user: User, store: Store) {
  const response = await callInternalAPIForUsers(
    "DELETE",
    `/stores/${store.uid}`,
    user.uid,
    store.storeId
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
    }
  );
  return response;
}