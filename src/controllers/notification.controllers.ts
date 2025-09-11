import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";
import { GetNotificationsSchema } from "../schemas/notification.schema";
import { prisma } from "../config/db.config";

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

    const notifications = prisma.notification.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    res.status(200).json({ notifications });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all orders " + err.message });
  }
};

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

    const notifications = prisma.notification.findMany({
      where: { userId: user.id },
      skip: (page - 1) * limit,
      take: limit,
    });

    res.status(200).json({ notifications });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch all orders " + err.message });
  }
};
