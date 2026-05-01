import jwt from "jsonwebtoken";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import type { Request, Response } from "express";
import { verifyGoogleIdToken } from "../helpers/googleverify";
import axios from "axios";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { env } from "../config/env.config";
import { encryptKey } from "../utils/encrypt";
import {
  GoogleCallbackQuerySchema,
  RedirectToGoogleQuerySchema,
  RoleEnum,
} from "../schemas/auth.schema";

const hashApiKey = (key: string) =>
  crypto.createHash("sha256").update(key).digest("hex");

const isValidPanelDomain = async (url: string): Promise<boolean> => {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const domain = hostname.split(":")[0];
    return !!domain.endsWith("validpanel.com");
  } catch {
    return false;
  }
};

export const logout = (req: Request, res: Response): void => {
  const cookieOptions = {
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };

  res.clearCookie("auth_token", cookieOptions);
  res.clearCookie("csrf_token", cookieOptions);
  res.status(200).json({ success: "Logged out successfully" });
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
        const rawApiKey = uuidv4();
        const encrypted = encryptKey(rawApiKey);
        return tx.user.create({
          data: {
            email: googleUser.email,
            image: googleUser.picture,
            password: await bcrypt.hash(Date.now().toString(), 10),
            encryptedApiKey: encrypted.encryptedKey,
            apiKeyIv: encrypted.iv,
            apiKeyHash: hashApiKey(rawApiKey),
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