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
      res.json({ error: queryParsed.error.flatten() });
      return;
    }

    const { page, limit } = queryParsed.data;

    const notifications = await prisma.notification.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    res.status(200).json({ notifications });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all notifcations " + err.message });
  }
};
