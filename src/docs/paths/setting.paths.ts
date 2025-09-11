import { registry } from "../components/registry";
import {
  BadRequest,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";
import { UpdateSettingSchema } from "../../schemas/setting.schema";
import {
  GetSetingsForAdminsResponse,
  GetSetingsForUsersResponse,
} from "../responses/setting.response";

// GET /setting
registry.registerPath({
  method: "get",
  path: "/setting",
  summary: "Get settings for users or general use",
  tags: ["Settings"],
  responses: {
    200: GetSetingsForUsersResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// GET /setting
registry.registerPath({
  method: "get",
  path: "/setting/admin",
  summary: "Get settings for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Settings"],
  responses: {
    200: GetSetingsForAdminsResponse,
    400: BadRequest,
    500: ServerError,
  },
});

// PUT /setting
registry.registerPath({
  method: "put",
  path: "/setting",
  summary: "Update settings for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Settings"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateSettingSchema,
        },
      },
    },
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    500: ServerError,
  },
});
