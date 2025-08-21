import { registry } from "../components/registry";
import { AuthenticateAdminSchema } from "../../schemas/admin.schema";
import { AuthenticateAdminResponse } from "../responses/admin.response";
import { BadRequest, ServerError } from "../responses/common.response";

// Authenticate admin
registry.registerPath({
  method: "post",
  path: "/admin/me",
  summary: "Authenticate admin",
  tags: ["Admins"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AuthenticateAdminSchema,
        },
      },
    },
  },
  responses: {
    200: AuthenticateAdminResponse,
    400: BadRequest,
    500: ServerError,
  },
});
