import type { Request, Response } from "express";
import {
  GetAllOrdersRequestSchema,
  GetMyOrdersRequestSchema,
} from "../schemas/order.schema";
import { AuthSchema } from "../schemas/user.schema";
import {
  callInternalAPIForAdmins,
  callInternalAPIForUsers,
} from "../utils/internalApi";
import { NormalizedOrder } from "../types/order.types";
import { mapShopOrder, mapSocialOrder } from "../utils/mappers/order.mappers";
import { AdminAuthSchema } from "../schemas/admin.schema";

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const queryParsed = GetAllOrdersRequestSchema.safeParse(req.query);
    if (!queryParsed.success) {
      res.json({ error: queryParsed.error.flatten() });
      return;
    }
    const authParsed = AdminAuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
      res.json({ error: authParsed.error.flatten() });
      return;
    }

    const { user } = authParsed.data;
    const { page, limit } = queryParsed.data;

    const socialMediaStoreOrders = await callInternalAPIForAdmins(
      "GET",
      `/orders?page=${page}&limit=${limit}`,
      user.uid,
      "SOCIAL"
    );

    const shopOrders =
      (await callInternalAPIForAdmins(
        "GET",
        `/orders?page=${page}&limit=${limit}`,
        user.uid,
        "SHOP"
      )) || [];

    // Normalize
    const normalizedSocial: NormalizedOrder[] =
      socialMediaStoreOrders.map(mapSocialOrder);
    const normalizedShop: NormalizedOrder[] = shopOrders.map(mapShopOrder);

    // Merge into one array
    const allOrders: NormalizedOrder[] = [
      ...normalizedSocial,
      ...normalizedShop,
    ];

    res.status(200).json({ orders: allOrders });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all orders " + err.message });
  }
};

/**
 * Get current user's orders
 */
export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const queryParsed = GetMyOrdersRequestSchema.safeParse(req.query);
    if (!queryParsed.success) {
      res.json({ error: queryParsed.error.flatten() });
      return;
    }
    const authParsed = AuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
      res.json({ error: authParsed.error.flatten() });
      return;
    }

    const { user } = authParsed.data;
    const { storeId, page, limit } = queryParsed.data;

    const response = await callInternalAPIForUsers(
      "GET",
      `/orders?page=${page}&limit=${limit}`,
      user.uid,
      storeId
    );

    let allOrders: NormalizedOrder[];
    // Normalize based on store type
    if (response.storeType === "SOCIAL") {
      allOrders = response.data.map(mapSocialOrder);
    } else if (response.storeType === "SHOP") {
      allOrders = response.data.map(mapShopOrder);
    }

    res.status(200).json({ orders: response.data });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all orders " + err.message });
  }
};
