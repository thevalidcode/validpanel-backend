import { registry } from "../components/registry";
import { BadRequest, ServerError } from "../responses/common.response";
import { GetNotificationsSchema } from "../../schemas/notification.schema";
import {
  GetAllNotificationsResponse,
  GetAUserNotificationsResponse,
} from "../responses/notification.response";

registry.registerPath({
  method: "get",
  path: "/notifications",
  summary: "Get all notifications with pagination for admins",
  security: [{ CookieAuth: [] }],
  tags: ["Notifications"],
  request: {
    query: GetNotificationsSchema,
  },
  responses: {
    200: GetAllNotificationsResponse,
    400: BadRequest,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/notifications/me",
  summary: "Get notifications for a specific user with pagination",
  security: [{ CookieAuth: [] }],
  tags: ["Notifications"],
  request: {
    params: GetNotificationsSchema,
  },
  responses: {
    200: GetAUserNotificationsResponse,
    400: BadRequest,
    404: {
      description: "No notification found",
    },
    500: ServerError,
  },
});
