import { registry } from "../components/registry";
import {
  BadRequest,
  ServerError,
  SuccessResponse,
} from "../responses/common.response";
import {
  GetNotificationsSchema,
  NotificationsUidSchema,
} from "../../schemas/notification.schema";
import {
  GetAllNotificationsResponse,
  GetAUserNotificationsResponse,
  GetNotificationUnreadCountResponse,
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
    query: GetNotificationsSchema,
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

registry.registerPath({
  method: "get",
  path: "/notifications/unread-count",
  summary: "Get notifications unread count for a specific user",
  security: [{ CookieAuth: [] }],
  tags: ["Notifications"],
  responses: {
    200: GetNotificationUnreadCountResponse,
    400: BadRequest,
    404: {
      description: "No notification found",
    },
    500: ServerError,
  },
});

registry.registerPath({
  method: "patch",
  path: "/notifications/{uid}/mark-as-read",
  summary: "Mark a notification as read",
  security: [{ CookieAuth: [] }],
  tags: ["Notifications"],
  request: {
    params: NotificationsUidSchema,
  },
  responses: {
    200: SuccessResponse,
    400: BadRequest,
    404: {
      description: "No notification found",
    },
    500: ServerError,
  },
});
