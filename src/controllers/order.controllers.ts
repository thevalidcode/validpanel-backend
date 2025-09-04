import type { Request, Response } from "express";
import {
  CreateStoreSchema,
  UpdateStoreSchema,
  StoreUidSchema,
  AdminActionSchema,
} from "../schemas/store.schema";
import { AuthSchema } from "../schemas/user.schema";
import { callInternalAPI } from "../utils/internalApi";

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { storeType, storeId, email, password } = req.query;

    if (!storeType || !storeId || !email || !password) {
      res.status(400).json({ error: "Missing required query parameters" });
      return;
    }

    // Pagination parameters
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const data = await callInternalAPI(
      "GET",
      `/orders?page=${page}&limit=${limit}`,
      "admin", // userKey
      email as string,
      password as string,
      storeType as "social-media-store" | "digital" | "shop",
      storeId as string
    );

    res.status(200).json({ orders: data });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch all orders " + err.message });
  }
};

/**
 * Get current user's orders
 */
export const getMyOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeType, storeId, email, password } = req.query;

    if (!storeType || !storeId || !email || !password) {
      res.status(400).json({ error: "Missing required query parameters" });
      return;
    }

    // Pagination parameters
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);

    const data = await callInternalAPI(
      "GET",
      `/orders/me?page=${page}&limit=${limit}`,
      "user", // userKey
      email as string,
      password as string,
      storeType as "social-media-store" | "digital" | "shop",
      storeId as string
    );

    res.status(200).json({ orders: data });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch user orders " + err.message });
  }
};
