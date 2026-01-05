import type { Request, Response } from "express";
import { UploadImageRequest, FileSchema } from "../schemas/files.schema";
import { uploadToS3 } from "../services/s3.services";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { user, type } = req.auth!;

    const bodyResult = UploadImageRequest.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.flatten() });
      return;
    }

    const { collection } = bodyResult.data;

    const safeName = req.file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "")
      .toLowerCase();

    const existingLog = await prisma.uploadLog.findFirst({
      where: {
        collection,
        filename: safeName,
      },
    });

    if (existingLog) {
      res.status(200).json({
        error: "This file has already been uploaded",
        url: existingLog.url,
        collection: existingLog.collection,
      });
      return;
    }

    const buffer = req.file.buffer;
    const s3Url = await uploadToS3(buffer, safeName, user.id, collection);

    if (!s3Url) {
      res.status(500).json({ error: "Failed to upload image to S3" });
      return;
    }

    const uploadLog = await prisma.$transaction(async (tx) => {
      const log = await tx.uploadLog.create({
        data: {
          uid: uuidv4(),
          collection,
          filename: safeName,
          ...(type === "admin" ? { adminId: user.id } : { userId: user.id }),
          url: s3Url,
          mimetype: req.file?.mimetype || "application/octet-stream",
          size: req.file?.size || 0,
        },
      });

      return log;
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      url: uploadLog.url,
      collection: uploadLog.collection,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPreviousImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const queryParsed = UploadImageRequest.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { user, type } = authParsed.data;
  const { collection } = queryParsed.data;

  try {
    const images = await prisma.uploadLog.findMany({
      where: {
        ...(type === "admin" ? { adminId: user.id } : { userId: user.id }),
        collection,
      },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json({ images });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
