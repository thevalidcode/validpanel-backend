import type { Request, Response } from "express";
import { PaymentPublicSchema, PaymentSchema } from "../schemas/payment.schema";
import { AuthSchema } from "../schemas/user.schema";
import { prisma } from "../config/db.config";

export const getPaymentsForUsers = async (
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
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { id: "desc" },
    });

    const parsedPayments = payments.map(
      (o) => PaymentPublicSchema.safeParse(o).data
    );
    res.status(200).json(parsedPayments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPaymentsForAdmins = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const payment = await prisma.payment.findMany({
      orderBy: { id: "desc" },
    });

    const parsedPayments = payment.map(
      (o) => PaymentSchema.safeParse(o).data
    );
    res.status(200).json(parsedPayments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
