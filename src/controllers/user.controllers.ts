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
  selectPlanSchema,
  paymentSchema,
  setupStoreSchema,
} from "../schemas/user.schema";
import { prisma } from "../config/db.config";
import { OnboardingStep } from "../../prisma/generated";
import { InitializeSubscriptionPaymentSchema } from "../schemas/payment.schema";
import * as paymentServices from "../services/payment.services";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        uid: true,
        email: true,
        fullName: true,
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
      nextStep: "PLAN" as OnboardingStep,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const selectPlan = async (req: Request, res: Response) => {
  try {
    const parsed = selectPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { planId } = parsed.data;
    const userId = req.auth?.user.id!;

    // Check if plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      res.status(404).json({ error: "Subscription plan not found" });
      return;
    }

    // Create subscription (status depends on price)
    const status = plan.price.equals(0) ? "ACTIVE" : "PENDING";

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        status,
        startedAt: new Date(),
        expiresAt: plan.price.equals(0)
          ? new Date(new Date().setFullYear(new Date().getFullYear() + 100)) // basically never expires
          : null,
      },
    });

    // Update user onboarding step
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStep: plan.price.equals(0) ? "STORE_DETAILS" : "PAYMENT",
      },
    });

    res.status(201).json({
      message: "Plan selected successfully",
      subscription,
      nextStep: plan.price.equals(0) ? "STORE_DETAILS" : "PAYMENT",
    });
  } catch (error: any) {
    console.error("Error selecting plan:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

export const initializeSubscriptionPayment = async (
  req: Request,
  res: Response
) => {
  const parsed = InitializeSubscriptionPaymentSchema.safeParse(req.body);
  const authParsed = AuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const { user } = authParsed.data;
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const result = await paymentServices.createSubscriptionPayment(
      user,
      parsed.data
    );
    res.status(200).json({ status: "success", ...result });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
};

export const setupStore = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.user.id!;
    const parsed = setupStoreSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { type, name, domain, subscriptionId, logoUrl, color } = parsed.data;

    // Check if domain already exists
    const existingDomain = await prisma.store.findUnique({
      where: { uid: domain },
    });

    if (existingDomain) {
      return res.status(400).json({ error: "Domain already taken" });
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: {
        expiresAt: "desc", // get latest subscription
      },
    });

    if (!existingSubscription) {
      res.status(400).json({ error: "Subscription not found" });
      return;
    }

    // Create store
    const store = await prisma.store.create({
      data: {
        type,
        name,
        uid: domain,
        plan: existingSubscription.plan.name,
        ownerId: userId,
      },
    });

    // Update user onboarding step → move forward
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: "COMPLETE" },
    });

    res.status(201).json({
      message: "Store setup successful",
      store,
      onboardingStep: "COMPLETE" as OnboardingStep,
    });
  } catch (err: any) {
    console.error("Store setup error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
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
    if (account.status === "BANNED")
      return res.status(403).json({ error: "Account is banned." });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect login details" });

    const token = jwt.sign(
      { email, apiKey: account.apiKey, uid: account.uid },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: "Logged in successfully",
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
  res.status(200).json({ email: parsed.data.user.email });
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
