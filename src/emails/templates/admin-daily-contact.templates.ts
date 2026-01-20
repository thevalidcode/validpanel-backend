import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";
import circularIcon from "./components/circularIcon";

export interface AdminDailySummaryVars extends LogoVars {
  date: string;
  newUsers: number;
  newStores: number;
  newSubscriptions: number;
  totalRevenue: string;
  currency: string;
  pendingApprovals: number;
  pendingPayments: number;
}

export interface AdminContactMessageVars extends LogoVars {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  ticketId: string;
  receivedAt: string;
}

export const adminDailySummary = ({
  date,
  newUsers,
  newStores,
  newSubscriptions,
  totalRevenue,
  currency,
  pendingApprovals,
  pendingPayments,
  logo,
}: AdminDailySummaryVars): TemplateResult => {
  const adminUrl = "https://validpanel.com/admin/dashboard";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('📊','linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            Daily Summary
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">${date}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:15px; border-radius:10px; text-align:center;">
          <p style="margin:0 0 5px 0; font-size:12px; color:#065F46;">Total Revenue</p>
          <p style="margin:0; font-size:32px; font-weight:700; color:#065F46;">${currency} ${totalRevenue}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td width="33%" style="padding:10px;">
          <div style="background:#EDE9FE; padding:15px; border-radius:8px; text-align:center;">
            <p style="margin:0; font-size:24px; font-weight:700; color:#7C3AED;">${newUsers}</p>
            <p style="margin:5px 0 0 0; font-size:12px; color:#7C3AED;">New Users</p>
          </div>
        </td>
        <td width="33%" style="padding:10px;">
          <div style="background:#DBEAFE; padding:15px; border-radius:8px; text-align:center;">
            <p style="margin:0; font-size:24px; font-weight:700; color:#2563EB;">${newStores}</p>
            <p style="margin:5px 0 0 0; font-size:12px; color:#2563EB;">New Stores</p>
          </div>
        </td>
        <td width="33%" style="padding:10px;">
          <div style="background:#FCE7F3; padding:15px; border-radius:8px; text-align:center;">
            <p style="margin:0; font-size:24px; font-weight:700; color:#DB2777;">${newSubscriptions}</p>
            <p style="margin:5px 0 0 0; font-size:12px; color:#DB2777;">Subscriptions</p>
          </div>
        </td>
      </tr>
    </table>

    ${
      pendingApprovals > 0 || pendingPayments > 0
        ? `
    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0 0 10px 0; font-size:14px; font-weight:600; color:#92400E;">⚠️ Action Required</p>
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            ${
              pendingApprovals > 0
                ? `
            <tr>
              <td style="padding:3px 0; color:#333; font-size:13px;">• ${pendingApprovals} store${pendingApprovals > 1 ? "s" : ""} pending approval</td>
            </tr>
            `
                : ""
            }
            ${
              pendingPayments > 0
                ? `
            <tr>
              <td style="padding:3px 0; color:#333; font-size:13px;">• ${pendingPayments} payment${pendingPayments > 1 ? "s" : ""} pending verification</td>
            </tr>
            `
                : ""
            }
          </table>
        </td>
      </tr>
    </table>
    `
        : ""
    }

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${adminUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:12px 30px;
            border-radius:8px;
            font-weight:600;
            font-size:14px;
          ">View Dashboard</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Admin] Daily Summary - ${date}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export const adminContactMessage = ({
  senderName,
  senderEmail,
  subject,
  message,
  ticketId,
  receivedAt,
  logo,
}: AdminContactMessageVars): TemplateResult => {
  const adminUrl = `https://validpanel.com/admin/contact/${ticketId}`;

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('✉️','linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            New Contact Message
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">Ticket #${ticketId}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:10px; border-left:4px solid #3B82F6;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; width:100px;">From:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${senderName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Email:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">
                <a href="mailto:${senderEmail}" style="color:#7C3AED;">${senderEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Subject:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${subject}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Received:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${receivedAt}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F9FAFB; padding:20px; border-radius:10px; border:1px solid #E5E7EB;">
          <p style="margin:0 0 10px 0; font-size:13px; font-weight:600; color:#6B7280;">MESSAGE:</p>
          <p style="margin:0; font-size:14px; color:#333; line-height:1.6; white-space:pre-wrap;">${message}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${adminUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:12px 30px;
            border-radius:8px;
            font-weight:600;
            font-size:14px;
            margin-right:10px;
          ">Reply to Message</a>
          <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}" style="
            display:inline-block;
            background:#F3F4F6;
            color:#374151;
            text-decoration:none;
            padding:12px 30px;
            border-radius:8px;
            font-weight:600;
            font-size:14px;
            border:1px solid #D1D5DB;
          ">Reply via Email</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Contact] ${subject} - ${senderName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export default adminDailySummary;
