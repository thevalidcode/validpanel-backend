import type { Request, Response } from "express";
import { prisma } from "../config/db.config";
import {
  ContactMessageCreateRequestSchema,
  ContactMessageReplySchema,
} from "../schemas/contact.schema";
import { sendUserEmail, sendEmailToAdmins, sendReplyEmail } from "../emails";

// ============================================
// PUBLIC ENDPOINTS
// ============================================

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

    // Send confirmation email to the user and capture the messageId
    const emailResult = await sendUserEmail(
      email,
      "CONTACT_MESSAGE_USER_CONFIRMATION",
      {
        firstName,
        lastName,
      },
      '"Valid Panel Support" <support@validpanel.com>'
    );

    // Store the email messageId for threading future replies
    if (emailResult.success && emailResult.messageId) {
      await prisma.contactMessage.update({
        where: { uid: contactMessage.uid },
        data: { emailMessageId: emailResult.messageId },
      });
    }

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

// ============================================
// ADMIN ENDPOINTS - CONTACT MESSAGES
// ============================================

// Get all contact messages with reply count (admin only)
export const getContactMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const contactMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    });

    res.status(200).json(contactMessages);
  } catch (err: any) {
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get contact message by UID with all replies (admin only)
export const getContactMessageByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;

  try {
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { uid },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
        },
      },
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

// Update contact message status (admin only)
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

// Delete contact message (admin only)
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

// ============================================
// ADMIN ENDPOINTS - CONTACT REPLIES
// ============================================

// Get all replies for a contact message (admin only)
export const getContactReplies = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;

  try {
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { uid },
      select: { id: true },
    });

    if (!contactMessage) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }

    const replies = await prisma.contactReply.findMany({
      where: { contactMessageId: contactMessage.id },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(replies);
  } catch (err: any) {
    console.error("Error fetching contact replies:", err);
    res.status(500).json({ error: err.message });
  }
};

// Reply to a contact message - creates a contact reply (admin only)
export const replyToContactMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uid } = req.params;
  const bodyParsed = ContactMessageReplySchema.safeParse(req.body);

  if (!bodyParsed.success) {
    res.status(400).json({
      error: {
        body: bodyParsed.error.flatten(),
      },
    });
    return;
  }

  const { message } = bodyParsed.data;

  try {
    // Get the contact message with existing replies
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { uid },
      include: {
        replies: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { emailMessageId: true },
        },
      },
    });

    if (!contactMessage) {
      res.status(404).json({ error: "Contact message not found" });
      return;
    }

    // Build the references chain for proper email threading
    // Get all previous message IDs
    const allReplies = await prisma.contactReply.findMany({
      where: { contactMessageId: contactMessage.id },
      select: { emailMessageId: true },
      orderBy: { createdAt: "asc" },
    });

    const references: string[] = [];
    if (contactMessage.emailMessageId) {
      references.push(contactMessage.emailMessageId);
    }
    allReplies.forEach((reply) => {
      if (reply.emailMessageId) {
        references.push(reply.emailMessageId);
      }
    });

    // Determine the In-Reply-To header (last message in chain)
    const lastMessageId =
      contactMessage.replies[0]?.emailMessageId ||
      contactMessage.emailMessageId;

    // Send reply email using the template system with threading headers
    const emailResult = await sendReplyEmail(
      contactMessage.email,
      "CONTACT_MESSAGE_REPLY",
      {
        firstName: contactMessage.firstName,
        replyMessage: message,
        originalMessage: contactMessage.message,
        originalDate: contactMessage.createdAt.toLocaleString(),
      },
      lastMessageId,
      references
    );

    if (!emailResult.success) {
      res.status(500).json({ error: "Failed to send reply email" });
      return;
    }

    // Create the contact reply record
    const contactReply = await prisma.contactReply.create({
      data: {
        contactMessageId: contactMessage.id,
        sender: "ADMIN",
        senderName: "Valid Panel Support",
        senderEmail: "support@validpanel.com",
        content: message,
        emailMessageId: emailResult.messageId,
        inReplyTo: lastMessageId,
        references: emailResult.messageId
          ? [...references, emailResult.messageId]
          : references,
      },
    });

    // Update the contact message status to REPLIED
    await prisma.contactMessage.update({
      where: { uid },
      data: { status: "REPLIED" },
    });

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: contactReply,
    });
  } catch (err: any) {
    console.error("Error replying to contact message:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get a specific contact reply by UID (admin only)
export const getContactReplyByUid = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { replyUid } = req.params;

  try {
    const contactReply = await prisma.contactReply.findUnique({
      where: { uid: replyUid },
      include: {
        contactMessage: {
          select: {
            uid: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!contactReply) {
      res.status(404).json({ error: "Contact reply not found" });
      return;
    }

    res.status(200).json(contactReply);
  } catch (err: any) {
    console.error("Error fetching contact reply:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a contact reply (admin only)
export const deleteContactReply = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { replyUid } = req.params;

  try {
    await prisma.contactReply.delete({
      where: { uid: replyUid },
    });

    res.status(200).json({
      success: "Contact reply deleted successfully",
    });
  } catch (err: any) {
    console.error("Error deleting contact reply:", err);
    res.status(500).json({ error: err.message });
  }
};
