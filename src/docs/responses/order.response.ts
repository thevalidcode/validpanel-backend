import { z } from "zod";
import { OrderSchema } from "../../schemas/order.schema";

export const GetAllStoreOrdersResponse = {
  description: "List of all store orders",
  content: {
    "application/json": {
      schema: z.object({
        orders: z.array(OrderSchema),
      }),
    },
  },
};

export const GetAStoreOrdersResponse = {
  description: "List of a specific store order",
  content: {
    "application/json": {
      schema: z.object({
        orders: z.array(OrderSchema),
      }),
    },
  },
};
