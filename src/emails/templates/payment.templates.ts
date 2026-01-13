import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

// ============================================
// INTERFACES
// ============================================

export interface PaymentSuccessVars extends LogoVars {
  firstName: string;
  amount: string;
  currency: string;
  planName: string;
  transactionId: string;
  paymentMethod: string;
  paymentDate: string;
}

export interface PaymentFailedVars extends LogoVars {
  firstName: string;
  amount: string;
  currency: string;
  planName: string;
  reason?: string;
  paymentDate: string;
}

export interface PaymentPendingManualVars extends LogoVars {
  firstName: string;
  amount: string;
  currency: string;
  planName: string;
  paymentReference: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
}

export interface PaymentRefundedVars extends LogoVars {
  firstName: string;
  amount: string;
  currency: string;
  originalTransactionId: string;
  refundDate: string;
  reason?: string;
}

// ============================================
// TEMPLATES
// ============================================

/**
 * Payment success confirmation email
 */
export const paymentSuccess = ({
  firstName,
  amount,
  currency,
  planName,
  transactionId,
  paymentMethod,
  paymentDate,
  logo,
}: PaymentSuccessVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com/subscription?tab=billing";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:70px;
            height:70px;
            background:linear-gradient(135deg, #10B981 0%, #34D399 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:32px;">✅</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Payment Successful!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Thank you for your payment! Your transaction has been processed successfully.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:25px; border-radius:12px; border:1px solid #BBF7D0;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td colspan="2" style="padding-bottom:15px; text-align:center;">
                <p style="margin:0 0 5px 0; font-size:14px; color:#065F46;">Amount Paid</p>
                <p style="margin:0; font-size:32px; font-weight:700; color:#065F46;">${currency} ${amount}</p>
              </td>
            </tr>
          </table>
          <table role="presentation" style="width:100%; border-collapse:collapse; margin-top:15px; border-top:1px solid #BBF7D0; padding-top:15px;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:140px;">Transaction ID:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Plan:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Payment Method:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Date:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${paymentDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${dashboardUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">View Billing History</a>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin-top:30px; border-collapse:collapse;">
      <tr>
        <td style="padding-top:20px; border-top:1px solid #E5E7EB;">
          <p style="margin:0; font-size:14px; color:#6B7280;">
            Best regards,<br>
            <strong style="color:#333;">The Valid Panel Team</strong>
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Payment Confirmed: ${currency} ${amount}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Payment failed notification email
 */
export const paymentFailed = ({
  firstName,
  amount,
  currency,
  planName,
  reason,
  paymentDate,
  logo,
}: PaymentFailedVars): TemplateResult => {
  const retryUrl = "https://validpanel.com/subscription?tab=billing";
  const supportUrl = "https://validpanel.com/contact-us";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:70px;
            height:70px;
            background:linear-gradient(135deg, #EF4444 0%, #F87171 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:32px;">❌</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Payment Failed
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Unfortunately, we were unable to process your payment of <strong>${currency} ${amount}</strong> for the <strong>${planName}</strong> plan.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEE2E2; padding:25px; border-radius:12px; border:1px solid #FECACA;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:140px;">Amount:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${currency} ${amount}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Plan:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Date:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${paymentDate}</td>
            </tr>
            ${
              reason
                ? `
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Reason:</td>
              <td style="padding:8px 0; color:#DC2626; font-size:14px; font-weight:600;">${reason}</td>
            </tr>
            `
                : ""
            }
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px 20px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0; font-size:14px; color:#92400E;">
            <strong>💡 Common reasons for payment failure:</strong><br>
            • Insufficient funds<br>
            • Card expired or invalid<br>
            • Bank declined the transaction<br>
            • Incorrect payment details
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Please update your payment method and try again.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${retryUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
            margin-right:10px;
          ">Retry Payment</a>
          <a href="${supportUrl}" style="
            display:inline-block;
            background:#F3F4F6;
            color:#374151;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
            border:1px solid #D1D5DB;
          ">Contact Support</a>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin-top:30px; border-collapse:collapse;">
      <tr>
        <td style="padding-top:20px; border-top:1px solid #E5E7EB;">
          <p style="margin:0; font-size:14px; color:#6B7280;">
            Best regards,<br>
            <strong style="color:#333;">The Valid Panel Team</strong>
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Payment Failed: ${currency} ${amount}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Manual payment pending - instructions email
 */
export const paymentPendingManual = ({
  firstName,
  amount,
  currency,
  planName,
  paymentReference,
  bankDetails,
  logo,
}: PaymentPendingManualVars): TemplateResult => {
  const supportUrl = "https://validpanel.com/contact-us";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:70px;
            height:70px;
            background:linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:32px;">🏦</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Complete Your Payment
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Thank you for choosing the <strong>${planName}</strong> plan! Please complete your payment using the details below.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%); padding:25px; border-radius:12px; text-align:center;">
          <p style="margin:0 0 5px 0; font-size:14px; color:#7C3AED;">Amount to Pay</p>
          <p style="margin:0; font-size:36px; font-weight:700; color:#7C3AED;">${currency} ${amount}</p>
        </td>
      </tr>
    </table>

    ${
      bankDetails
        ? `
    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F9FAFB; padding:25px; border-radius:12px; border:1px solid #E5E7EB;">
          <h3 style="color:#333; margin:0 0 15px 0; font-size:16px;">
            🏦 Bank Transfer Details
          </h3>
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:140px;">Bank Name:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${bankDetails.bankName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Account Name:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${bankDetails.accountName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Account Number:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${bankDetails.accountNumber}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `
        : ""
    }

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:20px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0 0 10px 0; font-size:14px; color:#92400E; font-weight:600;">
            ⚠️ Important: Include this reference in your payment
          </p>
          <p style="margin:0; font-size:20px; font-weight:700; color:#92400E; font-family:monospace; background:#FDE68A; padding:10px; border-radius:4px; text-align:center;">
            ${paymentReference}
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:15px 20px; border-radius:8px;">
          <p style="margin:0; font-size:14px; color:#6B7280;">
            <strong>📋 Next Steps:</strong><br>
            1. Make your payment using the details above<br>
            2. Include the payment reference in your transfer<br>
            3. Our team will verify your payment within 24-48 hours<br>
            4. You'll receive a confirmation email once activated
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Need help? Contact our support team.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${supportUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">Contact Support</a>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin-top:30px; border-collapse:collapse;">
      <tr>
        <td style="padding-top:20px; border-top:1px solid #E5E7EB;">
          <p style="margin:0; font-size:14px; color:#6B7280;">
            Best regards,<br>
            <strong style="color:#333;">The Valid Panel Team</strong>
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Complete Your Payment: ${currency} ${amount} for ${planName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Payment refunded notification email
 */
export const paymentRefunded = ({
  firstName,
  amount,
  currency,
  originalTransactionId,
  refundDate,
  reason,
  logo,
}: PaymentRefundedVars): TemplateResult => {
  const supportUrl = "https://validpanel.com/contact-us";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:70px;
            height:70px;
            background:linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:32px;">💸</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Payment Refunded
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      A refund has been processed for your account. The funds should appear in your original payment method within 5-10 business days.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#DBEAFE; padding:25px; border-radius:12px; border:1px solid #BFDBFE;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td colspan="2" style="padding-bottom:15px; text-align:center;">
                <p style="margin:0 0 5px 0; font-size:14px; color:#1E40AF;">Refund Amount</p>
                <p style="margin:0; font-size:32px; font-weight:700; color:#1E40AF;">${currency} ${amount}</p>
              </td>
            </tr>
          </table>
          <table role="presentation" style="width:100%; border-collapse:collapse; margin-top:15px; border-top:1px solid #BFDBFE; padding-top:15px;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:160px;">Original Transaction:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${originalTransactionId}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Refund Date:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${refundDate}</td>
            </tr>
            ${
              reason
                ? `
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Reason:</td>
              <td style="padding:8px 0; color:#333; font-size:14px;">${reason}</td>
            </tr>
            `
                : ""
            }
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      If you have any questions about this refund, please don't hesitate to contact us.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${supportUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">Contact Support</a>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin-top:30px; border-collapse:collapse;">
      <tr>
        <td style="padding-top:20px; border-top:1px solid #E5E7EB;">
          <p style="margin:0; font-size:14px; color:#6B7280;">
            Best regards,<br>
            <strong style="color:#333;">The Valid Panel Team</strong>
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `Refund Processed: ${currency} ${amount}`,
    children: bodyContent,
    logoUrl: logo,
  });
};
