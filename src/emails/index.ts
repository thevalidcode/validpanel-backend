import nodemailer from "nodemailer";
import { prisma } from "../config/db.config";
import { EmailTemplateVars, getTemplate } from "./templates";

interface DispatchEmailParams {
  from: string;
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

interface DispatchEmailResult {
  success: boolean;
  messageId?: string;
}

interface BuildTemplateResult {
  subject: string;
  html: string;
}

// ----------------------------
// Transporter Setup
// ----------------------------
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

// ----------------------------
// Utility: Interpolation
// ----------------------------
function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(
    /\{\{(.*?)\}\}/g,
    (_, key) => variables[key.trim()] ?? ""
  );
}

// ----------------------------
// Load General Settings
// ----------------------------
async function loadGeneralSettings(): Promise<{ logoUrl: string }> {
  const setting = await prisma.setting.findFirst();
  return { logoUrl: setting?.logoUrl ?? "" };
}

// ----------------------------
// Build Email Template
// ----------------------------
export async function buildEmailTemplate(
  type: keyof EmailTemplateVars,
  data: Record<string, any>,
  logoUrl: string
): Promise<{ subject: string; html: string }> {
  const template = await prisma.emailTemplate.findFirst({ where: { type } });
  const variables = { logo: logoUrl, ...data };

  const htmlFromDb = template ? interpolate(template.content, variables) : "";
  const fallback = getTemplate(type, variables);
  const newSubject = template?.subject || fallback.subject;

  return {
    subject: newSubject,
    html: htmlFromDb || fallback.html,
  };
}

// ----------------------------
// Dispatch Email & Log
// ----------------------------
async function dispatchEmail({
  from,
  to,
  subject,
  html,
  headers,
}: DispatchEmailParams): Promise<DispatchEmailResult> {
  try {
    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      headers: headers || {},
    });

    await prisma.emailLog.create({
      data: {
        sender: from,
        receiver: to,
        subject,
        html,
        status: "SUCCESS",
        messageId: result.messageId,
        response: result.response,
        timestamp: new Date(),
      },
    });

    return { success: true, messageId: result.messageId };
  } catch (err: any) {
    await prisma.emailLog.create({
      data: {
        sender: from,
        receiver: to,
        subject,
        html,
        status: "ERROR",
        response: err.message,
        timestamp: new Date(),
      },
    });

    console.error(`Failed to send email to ${to}:`, err.message);
    return { success: false };
  }
}

// ----------------------------
// Send Email to Admins
// ----------------------------
export async function sendEmailToAdmins(
  type: keyof EmailTemplateVars,
  data: Record<string, any>,
  from = '"Valid Panel" <contact@validpanel.com>'
): Promise<DispatchEmailResult> {
  try {
    const { logoUrl } = await loadGeneralSettings();
    const { subject, html } = await buildEmailTemplate(type, data, logoUrl);

    const adminEmail = "backend@validpanel.com";
    return await dispatchEmail({ from, to: adminEmail, subject, html });
  } catch (err: any) {
    console.error(`sendEmailToAdmins error: ${err.message}`);
    return { success: false };
  }
}

// ----------------------------
// Send Email to a User
// ----------------------------
export async function sendUserEmail(
  to: string,
  type: keyof EmailTemplateVars,
  data: Record<string, any> = {},
  from = '"Valid Panel" <notifications@validpanel.com>'
): Promise<DispatchEmailResult> {
  try {
    const { logoUrl } = await loadGeneralSettings();
    const { subject, html } = await buildEmailTemplate(type, data, logoUrl);

    return await dispatchEmail({ from, to, subject, html });
  } catch (err: any) {
    console.error(`sendUserEmail error for ${to}: ${err.message}`);
    return { success: false };
  }
}

// ----------------------------
// Send Email to a Specific Admin
// ----------------------------
export async function sendAdminEmail(
  type: keyof EmailTemplateVars,
  data: Record<string, any> = {},
  to?: string,
  from = '"Valid Panel" <admin@validpanel.com>'
): Promise<DispatchEmailResult> {
  try {
    const { logoUrl } = await loadGeneralSettings();
    const { subject, html } = await buildEmailTemplate(type, data, logoUrl);

    const adminEmail = to || "backend@validpanel.com";
    return await dispatchEmail({ from, to: adminEmail, subject, html });
  } catch (err: any) {
    console.error(`sendAdminEmail error: ${err.message}`);
    return { success: false };
  }
}

// ----------------------------
// Send Reply Email (with threading headers)
// ----------------------------
export async function sendReplyEmail(
  to: string,
  type: keyof EmailTemplateVars,
  data: Record<string, any> = {},
  replyToMessageId?: string | null,
  references?: string[],
  from = '"Valid Panel Support" <support@validpanel.com>'
): Promise<DispatchEmailResult> {
  try {
    const { logoUrl } = await loadGeneralSettings();
    const { subject, html } = await buildEmailTemplate(type, data, logoUrl);

    // Build threading headers if we have a message ID to reply to
    const headers: Record<string, string> = {};
    if (replyToMessageId) {
      headers["In-Reply-To"] = replyToMessageId;
      // Use provided references or fall back to single message ID
      headers["References"] = references?.length
        ? references.join(" ")
        : replyToMessageId;
    }

    return await dispatchEmail({ from, to, subject, html, headers });
  } catch (err: any) {
    console.error(`sendReplyEmail error for ${to}: ${err.message}`);
    return { success: false };
  }
}
