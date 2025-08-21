import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { env } from "../config/env.config";
import {
  AuthSchema,
  createUserRequestSchema,
  AuthenticateUserSchema,
  updateUserSchema,
} from "../schemas/user.schema";
import { prisma } from "../config/db.config";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        uid: true,
        email: true,
        fullName: true,
        plan: true,
        status: true,
      },
    });
    res.status(200).json(users);
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password, fullName } = parsed.data;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or username already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        uid: uuidv4(),
        fullName,
        password: hashedPassword,
        apiKey: uuidv4(),
      },
    });

    const token = jwt.sign(
      { email, apiKey: user.apiKey, role: "user" },
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

    res.status(201).json({
      success: "Successfully created user",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const me = async (req: Request, res: Response) => {
  const parsed = AuthenticateUserSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { email, password } = parsed.data;

  try {
    const account = await prisma.user.findFirst({ where: { email } });
    if (!account)
      return res.status(400).json({ error: "Incorrect login details" });
    if (account.status.toLowerCase() === "banned")
      return res.status(403).json({ error: "Account is banned." });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect login details" });

    const token = jwt.sign(
      { email, apiKey: account.apiKey, plan: account.plan },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...safeUser } = account;
    res.status(200).json({
      success: "Logged in successfully",
      plan: safeUser.plan,
      user: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserByUid = async (req: Request, res: Response) => {
  const { uid } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { uid },
      select: {
        id: true,
        uid: true,
        email: true,
        fullName: true,
        plan: true,
        status: true,
      },
    });
    res.status(200).json({ user });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const verifySession = async (req: Request, res: Response) => {
  const parsed = AuthSchema.safeParse(req.auth);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  res.status(200).json({ role: parsed.data.role });
};

export const deleteUser = async (req: Request, res: Response) => {
  const { uid } = req.body;

  try {
    await prisma.user.delete({ where: { uid } });
    res.status(200).json({ success: "Successfully deleted user" });
  } catch {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export const deleteUsers = async (req: Request, res: Response) => {
  const { uids } = req.body;

  try {
    await prisma.user.deleteMany({ where: { uid: { in: uids } } });
    res.status(200).json({ success: "Successfully deleted users" });
  } catch {
    res.status(500).json({ error: "Failed to delete users" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const input = updateUserSchema.safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: input.error.flatten() });

  const { uid, ...fields } = input.data;

  try {
    await prisma.user.update({
      where: { uid },
      data: fields,
    });
    res.status(200).json({ success: "Successfully updated user" });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
};
