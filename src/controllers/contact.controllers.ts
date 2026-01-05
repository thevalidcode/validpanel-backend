import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import { ContactMessageCreateRequestSchema } from "../schemas/contact.schema";
import { sendUserEmail, sendEmailToAdmins } from "../emails";

export const createContactMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const bodyParsed = ContactMessageCreateRequestSchema.safeParse(req.body);

  if (!bodyParsed.success) {
    res.status(400).json({
      error: {
        body: bodyParsed.error.flatten(),
      },
    });
    return;
  }

  const { firstName, lastName, email, message } = bodyParsed.data;

  try {
    // Create contact message in database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        firstName,
        lastName,
        email,
        message,
      },
    });

    // Send confirmation email to the user
    await sendUserEmail(email, "CONTACT_MESSAGE_USER_CONFIRMATION", {
      firstName,
      lastName,
    });

    // Send notification email to admins
    await sendEmailToAdmins("CONTACT_MESSAGE_ADMIN_NOTIFICATION", {
      firstName,
      lastName,
      email,
      message,
      uid: contactMessage.uid,
    });

    res.status(200).json({
      success: true,
      message: "Your message has been sent. We will respond within 24 hours.",
    });
  } catch (err: any) {
    console.error("Error creating contact message:", err);
    res.status(500).json({ error: err.message });
  }
};

// Admin endpoints for managing contact messages
export const getContactMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const contactMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(contactMessages);
  } catch (err: any) {
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getContactMessageByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;

  try {
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { uid },
    });

    if (!contactMessage) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }

    res.status(200).json(contactMessage);
  } catch (err: any) {
    console.error("Error fetching contact message:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateContactMessageStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: "Status is required" });
    return;
  }

  try {
    await prisma.contactMessage.update({
      where: { uid },
      data: { status },
    });

    res.status(200).json({
      success: "Contact message status updated successfully",
    });
  } catch (err: any) {
    console.error("Error updating contact message status:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteContactMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;

  try {
    await prisma.contactMessage.delete({
      where: { uid },
    });

    res.status(200).json({
      success: "Contact message deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting contact message:", err);
    res.status(500).json({ error: err.message });
  }
};
