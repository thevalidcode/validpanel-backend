import { z } from "zod";
import { CouponSchema } from "../../schemas/coupon.schema";

export const CouponListResponse = {
  description: "List of coupons",
  content: {
    "application/json": {
      schema: z.array(CouponSchema),
    },
  },
};

export const CouponObjectResponse = {
  description: "Coupon object",
  content: {
    "application/json": {
      schema: CouponSchema,
    },
  },
};

export const CouponWriteResponse = {
  description: "Coupon write response",
  content: {
    "application/json": {
      schema: z.object({
        success: z.string(),
      }),
    },
  },
};
