import { z } from "zod";
import { StoreSchema } from "../../schemas/store.schema";

export const GetStoresResponse = {
  description: "List of all active stores",
  content: {
    "application/json": {
      schema: z.object({
        stores: z.array(StoreSchema),
      }),
    },
  },
};

export const GetStoreByUidResponse = {
  description: "Get store details by UID",
  content: {
    "application/json": {
      schema: z.object({
        store: StoreSchema,
      }),
    },
  },
};

export const CreateStoreResponse = {
  description: "Store created successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        store: StoreSchema,
      }),
    },
  },
};

export const UpdateStoreResponse = {
  description: "Store updated successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
        store: StoreSchema,
      }),
    },
  },
};

export const DeleteStoreResponse = {
  description: "Store deleted successfully",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
      }),
    },
  },
};

export const StoreStatsResponse = {
  description: "Store statistics data",
  content: {
    "application/json": {
      schema: z.object({
        count: z.object({
          total: z.number(),
          active: z.number(),
          paused: z.number(),
          createdThisMonth: z.number(),
        }),
      }),
    },
  },
};
