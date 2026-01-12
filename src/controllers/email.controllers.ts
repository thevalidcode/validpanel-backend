import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { EmailListQuerySchema } from "../schemas/email.schema";

// Get all email logs (admin only)
export const getEmailLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const queryParsed = EmailListQuerySchema.safeParse(req.query);

  if (!queryParsed.success) {
    res.status(400).json({
      error: {
        query: queryParsed.error.flatten(),
      },
    });
    return;
  }

  const { status, receiver, sender, limit = 50, offset = 0 } = queryParsed.data;

  try {
    const where: any = {};

    if (status) where.status = status;
    if (receiver) where.receiver = { contains: receiver, mode: "insensitive" };
    if (sender) where.sender = { contains: sender, mode: "insensitive" };

    const [emails, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.emailLog.count({ where }),
    ]);

    res.status(200).json({
      data: emails,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (err: any) {
    console.error("Error fetching email logs:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get email log by UID (admin only)
export const getEmailLogByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;

  try {
    const email = await prisma.emailLog.findUnique({
      where: { uid },
    });

    if (!email) {
      res.status(404).json({ error: "Email not found" });
      return;
    }

    res.status(200).json(email);
  } catch (err: any) {
    console.error("Error fetching email log:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete email log (admin only)
export const deleteEmailLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;

  try {
    await prisma.emailLog.delete({
      where: { uid },
    });

    res.status(200).json({
      success: "Email log deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting email log:", err);
    res.status(500).json({ error: err.message });
  }
};
