import type { Request, Response } from "express";
import {
  TransactionPublicSchema,
  TransactionSchema,
} from "../schemas/transaction.schema";
import { AuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db.config";

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
      orderBy: { id: "desc" },
    });

    const parsedTransactions = transactions.map(
      (o) => TransactionPublicSchema.safeParse(o).data
    );
    res.status(200).json(parsedTransactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTransactionsForAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const transaction = await prisma.transaction.findMany({
      orderBy: { id: "desc" },
    });

    const parsedTransactions = transaction.map(
      (o) => TransactionSchema.safeParse(o).data
    );
    res.status(200).json(parsedTransactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
