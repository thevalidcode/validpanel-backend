import { z } from "zod";
import { NotificationSchema } from "../../schemas/notification.schema";

export const GetAllNotificationsResponse = {
  description: "List of all the platform's notifications",
  content: {
    "application/json": {
      schema: z.object({
        notifications: z.array(NotificationSchema),
      }),
    },
  },
};

export const GetAUserNotificationsResponse = {
  description: "List of a specific user's notifications",
  content: {
    "application/json": {
      schema: z.object({
        notifications: z.array(NotificationSchema),
      }),
    },
  },
};
