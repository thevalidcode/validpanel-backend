import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { encryptKey } from "../utils/encrypt";
import { AuthSchema } from "../schemas/user.schema";
import {
  DeletePaymentGatewaySchema,
  GetPaymentGatewayByIdSchema,
  PaymentCreateRequestSchema,
  PaymentUpdateRequestSchema,
} from "../schemas/paymentGateway.schema";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { Prisma } from "../../prisma/generated";

export const getPaymentGateways = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const gateways = await prisma.paymentGateway.findMany({
      select: {
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        image: true,
        description: true,
        min: true,
        max: true,
        status: true,
      },
      orderBy: { position: "asc" },
    });

    res.status(200).json(gateways);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewayByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = GetPaymentGatewayByIdSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }

  const { id } = paramsParsed.data;

  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id },
      select: {
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        image: true,
        description: true,
        min: true,
        max: true,
        status: true,
      },
    });

    res.status(200).json(gateway);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewaysForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);

  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  try {
    const gateways = await prisma.paymentGateway.findMany({
      where: { status: "ACTIVE" },
      select: {
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        image: true,
        description: true,
        position: true,
        min: true,
        max: true,
      },
      orderBy: { position: "asc" },
    });

    res.status(200).json(gateways);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getPaymentGatewayByUidForUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const paramsParsed = GetPaymentGatewayByIdSchema.safeParse(req.params);

  if (!authParsed.success || !paramsParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
      },
    });
    return;
  }
  const { id } = paramsParsed.data;

  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { id, status: "ACTIVE" },
      select: {
        createdAt: true,
        platform: true,
        name: true,
        uid: true,
        image: true,
        description: true,
        min: true,
        max: true,
      },
    });

    res.status(200).json(gateway);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addPaymentGateway = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const bodyParsed = PaymentCreateRequestSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  const reqData = bodyParsed.data;
  if (reqData.platform !== "MANUAL") {
    if (!reqData.secretKey) {
      res.status(400).json({
        error: "Secret key is required for this payment gateway.",
      });
      return;
    }
  }
  try {
    const gateway = await prisma.$transaction(async (tx) => {
      const paymentData: Prisma.PaymentGatewayCreateInput = {
        uid: uuidv4(),
        name: reqData.name,
        description: reqData.description,
        image: reqData.image,
        platform: reqData.platform,
        min: reqData.min,
        max: reqData.max,
        status: "ACTIVE",
        signature: crypto.randomBytes(32).toString("hex"),
      };

      if (reqData.secretKey) {
        const encrypted_key = encryptKey(reqData.secretKey);
        paymentData.encryptedSecretKey = encrypted_key.encryptedKey;
        paymentData.iv = encrypted_key.iv;
      }

      const payment = await tx.paymentGateway.create({
        data: paymentData,
      });

      return payment;
    });
    const signature = gateway.signature;

    res.status(200).json({
      success: "Payment gateway created successfully",
      signature,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePaymentGateway = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = PaymentUpdateRequestSchema.safeParse(req.body);

  if (!parsed.success || !authParsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const reqData = parsed.data;

  try {
    if (reqData.platform !== "MANUAL") {
      if (!reqData.secretKey) {
        res.status(400).json({
          error: "Secret key is required for this payment gateway.",
        });
        return;
      }
    }
    const paymentGatewayData: Prisma.PaymentGatewayUpdateInput = {
      name: reqData.name,
      description: reqData.description,
      image: reqData.image,
      min: reqData.min,
      max: reqData.max,
      signature: crypto.randomBytes(32).toString("hex"),
    };

    if (reqData.secretKey) {
      const encrypted_key = encryptKey(reqData.secretKey);
      paymentGatewayData.encryptedSecretKey = encrypted_key.encryptedKey;
      paymentGatewayData.iv = encrypted_key.iv;
    }

    await prisma.paymentGateway.update({
      where: { id: reqData.id },
      data: {
        ...paymentGatewayData,
      },
    });

    const payment = await prisma.paymentGateway.findFirst({
      where: { id: reqData.id },
    });

    res.status(200).json({
      success: "Payment gateway updated successfully.",
      signature: payment?.signature,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePaymentGateway = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AuthSchema.safeParse(req.auth);
  const parsed = DeletePaymentGatewaySchema.safeParse(req.body);

  if (!authParsed.success || !parsed.success) {
    res.status(400).json({
      error: {
        auth: authParsed.error?.flatten(),
        body: parsed.error?.flatten(),
      },
    });
    return;
  }

  const { id } = parsed.data;

  try {
    await prisma.paymentGateway.delete({
      where: { id },
    });

    res.status(200).json({ success: "Payment gateway deleted successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
