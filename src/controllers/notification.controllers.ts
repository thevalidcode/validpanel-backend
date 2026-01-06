import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";
import {
  GetNotificationsSchema,
  NotificationsUidSchema,
} from "../schemas/notification.schema";
import { prisma } from "../config/db.config";

export const getMyNotification = async (req: Request, res: Response) => {
  try {
    const queryParsed = GetNotificationsSchema.safeParse(req.query);
    if (!queryParsed.success) {
      res.json({ error: queryParsed.error.flatten() });
      return;
    }
    const authParsed = AuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
      res.json({ error: authParsed.error.flatten() });
      return;
    }

    const { user } = authParsed.data;
    const { page, limit } = queryParsed.data;

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ notifications });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all notifcations " + err.message });
  }
};

export const getUnreadNotificationCount = async (
  req: Request,
  res: Response
) => {
  try {
    const authParsed = AuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
      res.json({ error: authParsed.error.flatten() });
      return;
    }

    const { user } = authParsed.data;

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    res.status(200).json({ unreadCount });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch unread notifications: " + err.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const pathParsed = NotificationsUidSchema.safeParse(req.params);
    if (!pathParsed.success) {
      res.status(400).json({ error: pathParsed.error.flatten() });
      return;
    }
    const authParsed = AuthSchema.safeParse(req.auth);
    if (!authParsed.success) {
      res.status(400).json({ error: authParsed.error.flatten() });
      return;
    }

    const { user } = authParsed.data;
    const { uid } = pathParsed.data;

    await prisma.notification.update({
      where: { userId: user.id, uid },
      data: { isRead: true },
    });

    res.status(200).json({ success: "Notification marked as read" });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to mark notification as read." + err.message });
  }
};

export const getNotificationsForAdmins = async (
  req: Request,
  res: Response
) => {
  try {
    const queryParsed = GetNotificationsSchema.safeParse(req.query);
    if (!queryParsed.success) {
      return res.status(400).json({ error: queryParsed.error.flatten() });
    }

    const { page, limit } = queryParsed.data;

    const notifications = await prisma.notification.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const adminNotifications = notifications.map((notif) => {
      // Safely parse meta
      const meta = (notif.meta as Record<string, any>) || {};

      let title = notif.title;
      let message = notif.message;

      switch (notif.category) {
        case "PAYMENT":
          title = `Payment ${meta.status?.toUpperCase() || "UNKNOWN"}`;
          message = `A payment of ${meta.amount ?? "N/A"} ${
            meta.currency ?? ""
          } was ${meta.status === "success" ? "completed" : "failed"}.`;
          break;
        case "STORE":
          title = `Store Update: ${notif.title}`;
          message = notif.message;
          break;
        case "SUBSCRIPTION":
          title = `Subscription Alert`;
          message = notif.message;
          break;
        case "SYSTEM":
          title = notif.title;
          message = notif.message;
          break;
        default:
          title = notif.title;
          message = notif.message;
      }

      return {
        uid: notif.uid,
        title,
        message,
        category: notif.category,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        meta: notif.meta,
      };
    });

    return res.status(200).json({ notifications: adminNotifications });
  } catch (err: any) {
    return res
      .status(500)
      .json({ error: "Failed to fetch notifications: " + err.message });
  }
};
