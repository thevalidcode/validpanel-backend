import { registry } from "../components/registry";
import {
  CouponPublicContextQuerySchema,
  CouponPublicListQuerySchema,
  CouponCreateSchema,
  CouponUidSchema,
  CouponUpdateSchema,
} from "../../schemas/coupon.schema";
import {
  BadRequest,
  Forbidden,
  ServerError,
} from "../responses/common.response";
import {
  CouponListResponse,
  CouponObjectResponse,
  CouponWriteResponse,
} from "../responses/coupon.response";

registry.registerPath({
  method: "get",
  path: "/coupons",
  summary: "List public coupons with optional filters",
  tags: ["Coupons"],
  request: {
    query: CouponPublicListQuerySchema,
  },
  responses: {
    200: CouponListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/coupons/context",
  summary: "List public coupons by context",
  tags: ["Coupons"],
  request: {
    query: CouponPublicContextQuerySchema,
  },
  responses: {
    200: CouponListResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/coupons/admin",
  summary: "List coupons",
  tags: ["Coupons"],
  security: [{ CookieAuth: [] }],
  responses: {
    200: CouponListResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/coupons/admin/{uid}",
  summary: "Get coupon by UID",
  tags: ["Coupons"],
  security: [{ CookieAuth: [] }],
  request: {
    params: CouponUidSchema,
  },
  responses: {
    200: CouponObjectResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/coupons/admin",
  summary: "Create coupon",
  tags: ["Coupons"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CouponCreateSchema,
        },
      },
    },
  },
  responses: {
    200: CouponWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "patch",
  path: "/coupons/admin/{uid}",
  summary: "Update coupon",
  tags: ["Coupons"],
  security: [{ CookieAuth: [] }],
  request: {
    params: CouponUidSchema,
    body: {
      content: {
        "application/json": {
          schema: CouponUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: CouponWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "delete",
  path: "/coupons/admin/{uid}",
  summary: "Delete coupon",
  tags: ["Coupons"],
  security: [{ CookieAuth: [] }],
  request: {
    params: CouponUidSchema,
  },
  responses: {
    200: CouponWriteResponse,
    400: BadRequest,
    403: Forbidden,
    500: ServerError,
  },
});
