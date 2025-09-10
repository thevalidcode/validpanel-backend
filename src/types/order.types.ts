import { StoreType } from "../../prisma/generated";

export interface SocialOrderResponse {
  id: number;
  user: {
    email: string;
    fullName: string;
    image?: string;
  };
  service: string;
  price: string;
  status:
    | "PENDING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELED"
    | "ACTIVE"
    | "PROCESSING"
    | "PARTIAL";
  timestamp: string;
  currency: string;
}

export interface ShopOrderResponse {
  id: number;
  user: {
    email: string;
    fullName: string;
    image?: string;
  };
  name: string;
  price: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELED";
  timestamp: string;
  currency: string;
}

// Extract status union
export type OrderStatus =
  | SocialOrderResponse["status"]
  | ShopOrderResponse["status"];

// Normalized shape
export interface NormalizedOrder {
  id: string; // unique across all stores
  storeType: StoreType;
  customer: {
    email: string;
    name: string;
    image?: string;
  };
  amount: string;
  status: OrderStatus;
  createdAt: string; // ISO string
  currency: string;
}
