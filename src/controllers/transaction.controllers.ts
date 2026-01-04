import type { Request, Response } from "express";
import { AuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db.config";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const getTransactionsForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userUid: user.uid },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            id: true,
            uid: true,
            image: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            email: true,
            fullName: true,
            id: true,
            uid: true,
            image: true,
          },
        },
      },
    });

    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
