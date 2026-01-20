import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";
import circularIcon from "./components/circularIcon";

export interface AdminManualPaymentPendingVars extends LogoVars {
  storeName: string;
  storeId: string;
  ownerName: string;
  ownerEmail: string;
  amount: string;
  currency: string;
  planName: string;
  paymentReference: string;
  submittedAt: string;
}

export interface AdminPaymentReceivedVars extends LogoVars {
  storeName: string;
  storeId: string;
  ownerName: string;
  ownerEmail: string;
  amount: string;
  currency: string;
  planName: string;
  transactionId: string;
  paymentMethod: string;
  receivedAt: string;
}

export const adminManualPaymentPending = ({
  storeName,
  storeId,
  ownerName,
  ownerEmail,
  amount,
  currency,
  planName,
  paymentReference,
  submittedAt,
  logo,
}: AdminManualPaymentPendingVars): TemplateResult => {
  const adminUrl = `https://validpanel.com/admin/payments/pending`;

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('⏳','linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            Manual Payment Pending
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">Requires Verification</p>
        </td>
      </tr>
    </table>

    <p style="font-size:15px; line-height:1.6; margin:15px 0; color:#333;">
      A manual payment requires your verification and approval.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px; border-radius:10px; text-align:center;">
          <p style="margin:0 0 5px 0; font-size:12px; color:#92400E;">Amount</p>
          <p style="margin:0; font-size:28px; font-weight:700; color:#92400E;">${currency} ${amount}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:10px; border-left:4px solid #F59E0B;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; width:130px;">Payment Ref:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600; font-family:monospace;">${paymentReference}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Store:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${storeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Plan:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Owner:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Email:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">
                <a href="mailto:${ownerEmail}" style="color:#7C3AED;">${ownerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Submitted:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${submittedAt}</td>
            </tr>
          </table>
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
          ">Review Payment</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Action Required] Manual Payment: ${currency} ${amount} - ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export const adminPaymentReceived = ({
  storeName,
  storeId,
  ownerName,
  ownerEmail,
  amount,
  currency,
  planName,
  transactionId,
  paymentMethod,
  receivedAt,
  logo,
}: AdminPaymentReceivedVars): TemplateResult => {
  const adminUrl = `https://validpanel.com/admin/payments`;

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('💰','linear-gradient(135deg, #10B981 0%, #34D399 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            Payment Received
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">Admin Notification</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:15px; border-radius:10px; text-align:center;">
          <p style="margin:0 0 5px 0; font-size:12px; color:#065F46;">Revenue</p>
          <p style="margin:0; font-size:28px; font-weight:700; color:#065F46;">${currency} ${amount}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:10px; border-left:4px solid #10B981;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; width:130px;">Transaction ID:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-family:monospace;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Store:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${storeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Plan:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Payment Method:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Owner:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Date:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${receivedAt}</td>
            </tr>
          </table>
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
          ">View Payments</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Admin] Payment: ${currency} ${amount} from ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export default adminPaymentReceived;
