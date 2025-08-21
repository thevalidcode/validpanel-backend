import { z } from "zod";
import {
  AdminSchema,
  AuthenticateAdminResponseSchema,
} from "../../schemas/admin.schema";

export const AuthenticateAdminResponse = {
  description: "Authenticated admin session object",
  content: {
    "application/json": {
      schema: AuthenticateAdminResponseSchema,
    },
  },
};
