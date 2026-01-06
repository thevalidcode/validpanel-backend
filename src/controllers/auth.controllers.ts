import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import { verifyGoogleIdToken } from "../helpers/googleverify";
import axios from "axios";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env.config";
import {
  GoogleCallbackQuerySchema,
  RedirectToGoogleQuerySchema,
  VerifySessionCodeBodySchema,
  RoleEnum,
} from "../schemas/auth.schema";

const isValidPanelDomain = async (url: string): Promise<boolean> => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const domain = hostname.split(":")[0];
    return !!domain.endsWith("validpanel.com");
  } catch {
    return false;
  }
};

export const redirectToGoogle = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = RedirectToGoogleQuerySchema.safeParse(req.query as any);
  if (!parsed.success) {
    res.status(400).send("Missing or invalid redirect URL");
    return;
  }

  const { redirect, role } = parsed.data;

  const state = encodeURIComponent(
    JSON.stringify({
      redirect,
      role: role,
    })
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${env.GOOGLE_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&redirect_uri=${encodeURIComponent(
      "https://auth.validpanel.com/api/auth/core/callback/google"
    )}` +
    `&state=${state}`;

  res.redirect(authUrl);
};

export const googleCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsedQuery = GoogleCallbackQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    res.status(400).send("Missing code or state");
    return;
  }

  const { code, state } = parsedQuery.data;

  let redirectDomain: string, role: string;
  try {
    const parsed = JSON.parse(decodeURIComponent(state as string));
    redirectDomain = parsed.redirect;
    role = parsed.role;
  } catch {
    res.status(400).send("Invalid state");
    return;
  }

  const allowed = await isValidPanelDomain(redirectDomain);
  if (!allowed) {
    res.status(400).send("Unauthorized domain");
    return;
  }

  try {
    const params = new URLSearchParams();
    params.append("code", String(code));
    params.append("client_id", env.GOOGLE_CLIENT_ID);
    params.append("client_secret", env.GOOGLE_CLIENT_SECRET);
    params.append(
      "redirect_uri",
      "https://auth.validpanel.com/api/auth/core/callback/google"
    );
    params.append("grant_type", "authorization_code");

    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token } = tokenRes.data;
    if (!id_token) throw new Error("No id_token returned from Google");
    const googleUser = await verifyGoogleIdToken(id_token);

    if (!googleUser || !googleUser.email) {
      res.status(400).send("Google user info missing email");
      return;
    }

    // For ADMIN role, check admin model; do NOT auto-create admins
    if (role === RoleEnum.enum.ADMIN) {
      const admin = await prisma.admin.findFirst({
        where: { email: googleUser.email },
      });
      if (!admin) {
        res.status(404).send("Admin not found");
        return;
      }

      // use admin as the authenticated account for session creation
      const sessionCode = uuidv4();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.sessionCode.create({
        data: {
          code: sessionCode,
          email: admin.email,
          expiresAt,
          used: false,
        },
      });

      res.redirect(`${redirectDomain}?session_code=${sessionCode}`);
      return;
    }

    // Default: USER flow (same as before)
    let user = await prisma.user.findFirst({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.$transaction(async (tx) => {
        return tx.user.create({
          data: {
            email: googleUser.email,
            image: googleUser.picture,
            password: await bcrypt.hash(Date.now().toString(), 10),
            apiKey: uuidv4(),
            fullName: googleUser.name || "ValidPanel User",
          },
        });
      });
    }

    const sessionCode = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.sessionCode.create({
      data: {
        code: sessionCode,
        email: user.email,
        expiresAt,
        used: false,
      },
    });

    res.redirect(`${redirectDomain}?session_code=${sessionCode}`);
  } catch (err: any) {
    console.error("Google OAuth callback failed:", err);
    res.status(500).send("OAuth failed due to a server error.");
  }
};

export const verifySessionCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = VerifySessionCodeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { sessionCode, role } = parsed.data;

  if (!sessionCode || typeof sessionCode !== "string") {
    res.status(400).json({ error: "Invalid session code" });
    return;
  }

  const session = await prisma.sessionCode.findUnique({
    where: { code: sessionCode },
  });

  if (!session || session.used || new Date(session.expiresAt) < new Date()) {
    res.status(400).json({ error: "Session code expired or invalid" });
    return;
  }

  let account: any = null;
  if (role === RoleEnum.enum.ADMIN) {
    account = await prisma.admin.findFirst({
      where: { email: session.email },
    });
    if (!account) {
      res.status(404).json({ error: "Admin not found" });
      return;
    }
  } else {
    account = await prisma.user.findFirst({
      where: { email: session.email },
    });
    if (!account) {
      res.status(404).json({ error: "User not found" });
      return;
    }
  }

  const user = account;

  if (!user) {
    res.status(404).json({
      error:
        role === RoleEnum.enum.ADMIN ? "Admin not found" : "User not found",
    });
    return;
  }

  await prisma.sessionCode.update({
    where: { code: sessionCode },
    data: { used: true },
  });

  const token = jwt.sign(
    { uid: user.uid, apiKey: user.apiKey, email: user.email },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const { password: _, resetToken, resetTokenExpiry, ...safeUser } = user;

  res
    .status(200)
    .json({ success: "User authenticated successfully", user: safeUser });
};
