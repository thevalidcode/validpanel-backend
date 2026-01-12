#!/usr/bin/env node
/**
 * Email Receiver Script
 *
 * This script receives emails from the mail server via stdin (piped from Postfix/sendmail)
 * and processes them to link replies to existing contact message tickets.
 *
 * Setup in /etc/aliases:
 *   support: "|/path/to/node /path/to/receiveEmail.js"
 *
 * Then run: sudo newaliases
 */

import "dotenv/config";
import { simpleParser, ParsedMail } from "mailparser";
import { ContactReplySender } from "../../prisma/generated";
import { prisma } from "../config/db.config";

// ============================================
// CONFIGURATION - Email Size & Attachment Limits
// ============================================
const CONFIG = {
  // Maximum raw email size in bytes (10MB)
  MAX_RAW_EMAIL_SIZE: 10 * 1024 * 1024,
  // Maximum single attachment size in bytes (5MB)
  MAX_ATTACHMENT_SIZE: 5 * 1024 * 1024,
  // Maximum number of attachments
  MAX_ATTACHMENT_COUNT: 10,
  // Maximum text content size in bytes (1MB)
  MAX_TEXT_CONTENT_SIZE: 1 * 1024 * 1024,
  // Allowed domains that can reply to any ticket (e.g., internal support domains)
  ALLOWED_DOMAINS: ["validpanel.com"],
  // Grace period for disconnect in ms
  DISCONNECT_GRACE_PERIOD: 100,
};

interface ParsedEmail {
  messageId: string | undefined;
  inReplyTo: string | undefined;
  references: string[];
  from: string | undefined;
  fromName: string | undefined;
  to: string | undefined;
  subject: string | undefined;
  text: string | undefined;
  html: string | false | undefined;
  attachments: {
    filename: string | undefined;
    contentType: string;
    size: number;
  }[];
  rawSize: number;
}

interface ContactMessageWithParticipants {
  id: number;
  email: string;
  emailMessageId: string | null;
  // Participants are all unique sender emails that have replied to this contact
  participants: string[];
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates email size limits
 */
function validateEmailSize(
  rawEmail: string,
  parsed: ParsedMail
): string | null {
  // Check raw email size
  const rawSize = Buffer.byteLength(rawEmail, "utf8");
  if (rawSize > CONFIG.MAX_RAW_EMAIL_SIZE) {
    return `Email size (${formatBytes(
      rawSize
    )}) exceeds maximum allowed (${formatBytes(CONFIG.MAX_RAW_EMAIL_SIZE)})`;
  }

  // Check attachment count
  if (parsed.attachments.length > CONFIG.MAX_ATTACHMENT_COUNT) {
    return `Attachment count (${parsed.attachments.length}) exceeds maximum allowed (${CONFIG.MAX_ATTACHMENT_COUNT})`;
  }

  // Check individual attachment sizes
  for (const attachment of parsed.attachments) {
    if (attachment.size > CONFIG.MAX_ATTACHMENT_SIZE) {
      return `Attachment "${
        attachment.filename || "unnamed"
      }" size (${formatBytes(
        attachment.size
      )}) exceeds maximum allowed (${formatBytes(CONFIG.MAX_ATTACHMENT_SIZE)})`;
    }
  }

  // Check text content size
  const textSize = parsed.text ? Buffer.byteLength(parsed.text, "utf8") : 0;
  if (textSize > CONFIG.MAX_TEXT_CONTENT_SIZE) {
    return `Text content size (${formatBytes(
      textSize
    )}) exceeds maximum allowed (${formatBytes(CONFIG.MAX_TEXT_CONTENT_SIZE)})`;
  }

  return null;
}

/**
 * Validates sender authorization to prevent ticket hijacking
 * Sender must be:
 * 1. The original contact message owner (email matches)
 * 2. From an allowed domain (e.g., internal support)
 * 3. A participant who has already replied to this thread
 */
function validateSenderAuthorization(
  senderEmail: string | undefined,
  contactMessage: ContactMessageWithParticipants
): string | null {
  if (!senderEmail) {
    return "Sender email is missing";
  }

  const normalizedSender = senderEmail.toLowerCase().trim();

  // Check 1: Is sender the original contact message owner?
  if (normalizedSender === contactMessage.email.toLowerCase().trim()) {
    return null; // Authorized
  }

  // Check 2: Is sender from an allowed domain?
  const senderDomain = normalizedSender.split("@")[1];
  if (
    senderDomain &&
    CONFIG.ALLOWED_DOMAINS.includes(senderDomain.toLowerCase())
  ) {
    return null; // Authorized
  }

  // Check 3: Is sender a known participant in this thread?
  const isParticipant = contactMessage.participants.some(
    (p) => p.toLowerCase().trim() === normalizedSender
  );
  if (isParticipant) {
    return null; // Authorized
  }

  return `Unauthorized sender: ${senderEmail} is not the ticket owner, from an allowed domain, or a known participant`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============================================
// DATABASE FUNCTIONS
// ============================================

async function findContactMessageByReferences(
  messageId?: string,
  inReplyTo?: string,
  references?: string[]
): Promise<ContactMessageWithParticipants | null> {
  // First, try to find by inReplyTo header
  if (inReplyTo) {
    // Check if inReplyTo matches a contact message's emailMessageId
    const contactByInReplyTo = await prisma.contactMessage.findFirst({
      where: { emailMessageId: inReplyTo },
      select: {
        id: true,
        email: true,
        emailMessageId: true,
        replies: {
          select: { senderEmail: true },
          distinct: ["senderEmail"],
        },
      },
    });
    if (contactByInReplyTo) {
      return {
        id: contactByInReplyTo.id,
        email: contactByInReplyTo.email,
        emailMessageId: contactByInReplyTo.emailMessageId,
        participants: contactByInReplyTo.replies
          .map((r) => r.senderEmail)
          .filter((e): e is string => e !== null),
      };
    }

    // Check if inReplyTo matches a contact reply's emailMessageId
    const replyByInReplyTo = await prisma.contactReply.findFirst({
      where: { emailMessageId: inReplyTo },
      select: {
        contactMessageId: true,
        contactMessage: {
          select: {
            id: true,
            email: true,
            emailMessageId: true,
            replies: {
              select: { senderEmail: true },
              distinct: ["senderEmail"],
            },
          },
        },
      },
    });
    if (replyByInReplyTo) {
      return {
        id: replyByInReplyTo.contactMessage.id,
        email: replyByInReplyTo.contactMessage.email,
        emailMessageId: replyByInReplyTo.contactMessage.emailMessageId,
        participants: replyByInReplyTo.contactMessage.replies
          .map((r) => r.senderEmail)
          .filter((e): e is string => e !== null),
      };
    }
  }

  // Then try to find by references
  if (references && references.length > 0) {
    for (const ref of references) {
      const contactByRef = await prisma.contactMessage.findFirst({
        where: { emailMessageId: ref },
        select: {
          id: true,
          email: true,
          emailMessageId: true,
          replies: {
            select: { senderEmail: true },
            distinct: ["senderEmail"],
          },
        },
      });
      if (contactByRef) {
        return {
          id: contactByRef.id,
          email: contactByRef.email,
          emailMessageId: contactByRef.emailMessageId,
          participants: contactByRef.replies
            .map((r) => r.senderEmail)
            .filter((e): e is string => e !== null),
        };
      }

      const replyByRef = await prisma.contactReply.findFirst({
        where: { emailMessageId: ref },
        select: {
          contactMessageId: true,
          contactMessage: {
            select: {
              id: true,
              email: true,
              emailMessageId: true,
              replies: {
                select: { senderEmail: true },
                distinct: ["senderEmail"],
              },
            },
          },
        },
      });
      if (replyByRef) {
        return {
          id: replyByRef.contactMessage.id,
          email: replyByRef.contactMessage.email,
          emailMessageId: replyByRef.contactMessage.emailMessageId,
          participants: replyByRef.contactMessage.replies
            .map((r) => r.senderEmail)
            .filter((e): e is string => e !== null),
        };
      }
    }
  }

  return null;
}

// ============================================
// MAIN PROCESSING
// ============================================

async function processIncomingEmail(
  rawEmail: string,
  parsed: ParsedMail
): Promise<{ success: boolean; error?: string }> {
  // Validate email size limits first
  const sizeError = validateEmailSize(rawEmail, parsed);
  if (sizeError) {
    console.error(`[Email Receiver] Size validation failed: ${sizeError}`);
    return { success: false, error: sizeError };
  }

  const email: ParsedEmail = {
    messageId: parsed.messageId,
    inReplyTo: parsed.inReplyTo,
    references: Array.isArray(parsed.references)
      ? parsed.references
      : parsed.references
      ? [parsed.references]
      : [],
    from: parsed.from?.value?.[0]?.address,
    fromName: parsed.from?.value?.[0]?.name,
    to: parsed.to
      ? Array.isArray(parsed.to)
        ? parsed.to[0]?.text
        : parsed.to.text
      : undefined,
    subject: parsed.subject,
    text: parsed.text,
    html: parsed.html,
    attachments: parsed.attachments.map((a) => ({
      filename: a.filename,
      contentType: a.contentType,
      size: a.size,
    })),
    rawSize: Buffer.byteLength(rawEmail, "utf8"),
  };

  console.log(`[Email Receiver] Processing email from: ${email.from}`);
  console.log(`[Email Receiver] Subject: ${email.subject}`);
  console.log(`[Email Receiver] MessageId: ${email.messageId}`);
  console.log(`[Email Receiver] InReplyTo: ${email.inReplyTo}`);
  console.log(`[Email Receiver] References: ${email.references.join(", ")}`);
  console.log(`[Email Receiver] Raw size: ${formatBytes(email.rawSize)}`);
  console.log(`[Email Receiver] Attachments: ${email.attachments.length}`);

  // Find the contact message this email belongs to
  const contactMessage = await findContactMessageByReferences(
    email.messageId,
    email.inReplyTo,
    email.references
  );

  if (!contactMessage) {
    console.log(
      `[Email Receiver] No matching contact message found for this email. Ignoring.`
    );
    return { success: false, error: "No matching contact message found" };
  }

  console.log(
    `[Email Receiver] Found matching contact message ID: ${contactMessage.id}`
  );

  // Validate sender authorization to prevent ticket hijacking
  const authError = validateSenderAuthorization(email.from, contactMessage);
  if (authError) {
    console.error(`[Email Receiver] Authorization failed: ${authError}`);
    return { success: false, error: authError };
  }

  console.log(
    `[Email Receiver] Sender authorization validated for: ${email.from}`
  );

  // Use transaction for all database operations
  await prisma.$transaction(async (tx) => {
    // Check if this message already exists (duplicate prevention)
    if (email.messageId) {
      const existingMessage = await tx.contactReply.findUnique({
        where: { emailMessageId: email.messageId },
      });
      if (existingMessage) {
        console.log(
          `[Email Receiver] Message already exists, skipping duplicate.`
        );
        throw new Error("DUPLICATE_MESSAGE");
      }
    }

    // Get all existing message IDs for this contact to build references chain
    const existingMessages = await tx.contactReply.findMany({
      where: { contactMessageId: contactMessage.id },
      select: { emailMessageId: true },
      orderBy: { createdAt: "asc" },
    });

    const allReferences: string[] = [];
    if (contactMessage.emailMessageId) {
      allReferences.push(contactMessage.emailMessageId);
    }
    existingMessages.forEach((msg) => {
      if (msg.emailMessageId) {
        allReferences.push(msg.emailMessageId);
      }
    });

    // Create the contact reply
    await tx.contactReply.create({
      data: {
        contactMessageId: contactMessage.id,
        sender: ContactReplySender.USER,
        senderName: email.fromName || email.from,
        senderEmail: email.from,
        content: email.text?.slice(0, CONFIG.MAX_TEXT_CONTENT_SIZE) || "",
        htmlContent: email.html || null,
        emailMessageId: email.messageId,
        inReplyTo: email.inReplyTo,
        references: allReferences,
      },
    });

    // Update contact message status to PENDING (user replied, needs attention)
    await tx.contactMessage.update({
      where: { id: contactMessage.id },
      data: { status: "PENDING" },
    });
  });

  console.log(
    `[Email Receiver] Successfully created contact reply for contact ID: ${contactMessage.id}`
  );

  return { success: true };
}

// ============================================
// ENTRY POINT
// ============================================

async function main(): Promise<void> {
  return new Promise((resolve, reject) => {
    let rawEmail = "";
    let currentSize = 0;
    let sizeExceeded = false;

    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (chunk: string) => {
      const chunkSize = Buffer.byteLength(chunk, "utf8");
      currentSize += chunkSize;

      // Early rejection if size exceeds limit during streaming
      if (currentSize > CONFIG.MAX_RAW_EMAIL_SIZE) {
        if (!sizeExceeded) {
          sizeExceeded = true;
          console.error(
            `[Email Receiver] Email size exceeds maximum allowed (${formatBytes(
              CONFIG.MAX_RAW_EMAIL_SIZE
            )}). Rejecting.`
          );
        }
        return; // Stop accumulating data
      }

      rawEmail += chunk;
    });

    process.stdin.on("end", async () => {
      try {
        if (sizeExceeded) {
          console.error("[Email Receiver] Email rejected due to size limit.");
          resolve();
          return;
        }

        if (!rawEmail.trim()) {
          console.error("[Email Receiver] Empty email received. Ignoring.");
          resolve();
          return;
        }

        const parsed = await simpleParser(rawEmail);
        const result = await processIncomingEmail(rawEmail, parsed);

        if (!result.success && result.error !== "DUPLICATE_MESSAGE") {
          console.error(`[Email Receiver] Processing failed: ${result.error}`);
        }

        resolve();
      } catch (error: any) {
        if (error.message === "DUPLICATE_MESSAGE") {
          // Not a real error, just skip
          resolve();
        } else {
          console.error("[Email Receiver] Error processing email:", error);
          reject(error);
        }
      }
    });

    process.stdin.on("error", (error) => {
      console.error("[Email Receiver] stdin error:", error);
      reject(error);
    });
  });
}

// Graceful shutdown handler
async function shutdown(exitCode: number): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error("[Email Receiver] Error during disconnect:", e);
  }
  // Small delay to ensure buffers are flushed
  setTimeout(() => process.exit(exitCode), CONFIG.DISCONNECT_GRACE_PERIOD);
}

main()
  .then(() => shutdown(0))
  .catch(async (error) => {
    console.error("[Email Receiver] Fatal error:", error);
    await shutdown(1);
  });
