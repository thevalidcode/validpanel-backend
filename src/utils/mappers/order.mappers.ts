import {
  NormalizedOrder,
  SocialOrderResponse,
  ShopOrderResponse,
} from "../../types/order.types";

export const mapSocialOrder = (o: SocialOrderResponse): NormalizedOrder => ({
  id: `SOCIAL-${o.id}`,
  storeType: "SOCIAL",
  customer: { email: o.user.email, name: o.user.fullName, image: o.user.image },
  amount: o.price,
  status: o.status.toUpperCase() as NormalizedOrder["status"],
  createdAt: o.timestamp,
  currency: o.currency,
});

export const mapShopOrder = (o: ShopOrderResponse): NormalizedOrder => ({
  id: `SHOP-${o.id}`,
  storeType: "SHOP",
  customer: { email: o.user.email, name: o.user.fullName, image: o.user.image },
  amount: o.price,
  status: o.status.toUpperCase() as NormalizedOrder["status"],
  createdAt: o.timestamp,
  currency: o.currency,
});
