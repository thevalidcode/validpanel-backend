import type { Request, Response } from "express";
import { AdminAuthSchema } from "../schemas/admin.schema";
import {
  AdminKnowledgeBaseListQuerySchema,
  KnowledgeBaseCreateSchema,
  KnowledgeBaseSlugParamsSchema,
  KnowledgeBaseUidParamsSchema,
  KnowledgeBaseUpdateSchema,
  PublicKnowledgeBaseListQuerySchema,
} from "../schemas/knowledgeBase.schema";
import {
  createKnowledgeBase,
  deleteKnowledgeBase,
  getKnowledgeBaseByUid,
  getPublicKnowledgeBaseBySlug,
  listAdminKnowledgeBase,
  listPublicKnowledgeBase,
  updateKnowledgeBase,
} from "../services/knowledgeBase.service";

export const getKnowledgeBaseForPublic = async (
  req: Request,
  res: Response,
) => {
  const parsed = PublicKnowledgeBaseListQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await listPublicKnowledgeBase(parsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch knowledge base" });
  }
};

export const getKnowledgeBaseArticleBySlug = async (
  req: Request,
  res: Response,
) => {
  const parsed = KnowledgeBaseSlugParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const article = await getPublicKnowledgeBaseBySlug(parsed.data.slug);

    if (!article) {
      res.status(404).json({ error: "Knowledge base article not found" });
      return;
    }

    res.status(200).json({ article });
  } catch (error: any) {
    res
      .status(500)
      .json({
        error: error.message || "Failed to fetch knowledge base article",
      });
  }
};

export const getKnowledgeBaseForAdmin = async (req: Request, res: Response) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const queryParsed = AdminKnowledgeBaseListQuerySchema.safeParse(req.query);

  if (!authParsed.success || !queryParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        query: !queryParsed.success ? queryParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  try {
    const result = await listAdminKnowledgeBase(queryParsed.data);
    res.status(200).json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch knowledge base" });
  }
};

export const getKnowledgeBaseByUidForAdmin = async (
  req: Request,
  res: Response,
) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = KnowledgeBaseUidParamsSchema.safeParse(req.params);

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

  try {
    const article = await getKnowledgeBaseByUid(paramsParsed.data.uid);

    if (!article) {
      res.status(404).json({ error: "Knowledge base article not found" });
      return;
    }

    res.status(200).json({ article });
  } catch (error: any) {
    res
      .status(500)
      .json({
        error: error.message || "Failed to fetch knowledge base article",
      });
  }
};

export const createKnowledgeBaseForAdmin = async (
  req: Request,
  res: Response,
) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const bodyParsed = KnowledgeBaseCreateSchema.safeParse(req.body);

  if (!authParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  try {
    const article = await createKnowledgeBase(
      bodyParsed.data,
      authParsed.data.user.id,
    );
    res.status(201).json({ success: true, article });
  } catch (error: any) {
    if (error.message === "KNOWLEDGE_BASE_SLUG_EXISTS") {
      res.status(409).json({ error: "Knowledge base slug already exists" });
      return;
    }

    res
      .status(500)
      .json({
        error: error.message || "Failed to create knowledge base article",
      });
  }
};

export const updateKnowledgeBaseForAdmin = async (
  req: Request,
  res: Response,
) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = KnowledgeBaseUidParamsSchema.safeParse(req.params);
  const bodyParsed = KnowledgeBaseUpdateSchema.safeParse(req.body);

  if (!authParsed.success || !paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({
      error: {
        auth: !authParsed.success ? authParsed.error.flatten() : undefined,
        params: !paramsParsed.success
          ? paramsParsed.error.flatten()
          : undefined,
        body: !bodyParsed.success ? bodyParsed.error.flatten() : undefined,
      },
    });
    return;
  }

  try {
    const article = await updateKnowledgeBase(
      paramsParsed.data.uid,
      bodyParsed.data,
    );
    res.status(200).json({ success: true, article });
  } catch (error: any) {
    if (error.message === "KNOWLEDGE_BASE_NOT_FOUND") {
      res.status(404).json({ error: "Knowledge base article not found" });
      return;
    }

    if (error.message === "KNOWLEDGE_BASE_SLUG_EXISTS") {
      res.status(409).json({ error: "Knowledge base slug already exists" });
      return;
    }

    res
      .status(500)
      .json({
        error: error.message || "Failed to update knowledge base article",
      });
  }
};

export const deleteKnowledgeBaseForAdmin = async (
  req: Request,
  res: Response,
) => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  const paramsParsed = KnowledgeBaseUidParamsSchema.safeParse(req.params);

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

  try {
    await deleteKnowledgeBase(paramsParsed.data.uid);
    res.status(200).json({ success: true });
  } catch (error: any) {
    if (error.message === "KNOWLEDGE_BASE_NOT_FOUND") {
      res.status(404).json({ error: "Knowledge base article not found" });
      return;
    }

    res
      .status(500)
      .json({
        error: error.message || "Failed to delete knowledge base article",
      });
  }
};
