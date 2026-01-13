import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

// ============================================
// INTERFACES
// ============================================

export interface StoreCreatedVars extends LogoVars {
  firstName: string;
  storeName: string;
  storeDomain: string;
  storeType: string;
}

export interface StoreApprovedVars extends LogoVars {
  firstName: string;
  storeName: string;
  storeDomain: string;
}

export interface StorePausedVars extends LogoVars {
  firstName: string;
  storeName: string;
  reason?: string;
}

export interface StoreReactivatedVars extends LogoVars {
  firstName: string;
  storeName: string;
}

export interface StoreDeletedVars extends LogoVars {
  firstName: string;
  storeName: string;
}

// ============================================
// TEMPLATES
// ============================================

/**
 * Store created confirmation email
 */
export const storeCreated = ({
  firstName,
  storeName,
  storeDomain,
  storeType,
  logo,
}: StoreCreatedVars): TemplateResult => {
  const storeUrl = `https://${storeDomain}`;
  const dashboardUrl = "https://validpanel.com/stores";

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
            <span style="font-size:32px;">🏪</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Store Created Successfully!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Great news! Your new store <strong>"${storeName}"</strong> has been created successfully and is now pending approval.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F0FDF4; padding:20px; border-radius:12px; border:1px solid #BBF7D0;">
          <h3 style="color:#166534; margin:0 0 15px 0; font-size:16px;">
            📋 Store Details
          </h3>
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:120px;">Store Name:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${storeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Domain:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${storeDomain}.validpanel.com</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Type:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${storeType}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Status:</td>
              <td style="padding:8px 0;">
                <span style="
                  display:inline-block;
                  background:#FEF3C7;
                  color:#92400E;
                  padding:4px 12px;
                  border-radius:20px;
                  font-size:12px;
                  font-weight:600;
                ">Pending Approval</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px 20px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0; font-size:14px; color:#92400E;">
            <strong>⏳ What's Next?</strong><br>
            Our team will review your store and approve it within 24-48 hours. You'll receive an email once your store is live.
          </p>
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
          ">View My Stores</a>
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
    subject: `Store Created: ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Store approved notification email
 */
export const storeApproved = ({
  firstName,
  storeName,
  storeDomain,
  logo,
}: StoreApprovedVars): TemplateResult => {
  const storeUrl = `https://${storeDomain}`;
  const dashboardUrl = "https://validpanel.com/stores";

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
            Your Store is Now Live!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Congratulations! 🎉 Your store <strong>"${storeName}"</strong> has been approved and is now live. You can start using it right away!
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F0FDF4; padding:20px; border-radius:12px; border:1px solid #BBF7D0;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:120px;">Store Name:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${storeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Store URL:</td>
              <td style="padding:8px 0;">
                <a href="${storeUrl}" style="color:#7C3AED; font-size:14px; font-weight:600; text-decoration:none;">
                  ${storeUrl}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Status:</td>
              <td style="padding:8px 0;">
                <span style="
                  display:inline-block;
                  background:#D1FAE5;
                  color:#065F46;
                  padding:4px 12px;
                  border-radius:20px;
                  font-size:12px;
                  font-weight:600;
                ">Active</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${storeUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #10B981 0%, #34D399 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
            margin-right:10px;
          ">Visit Store</a>
          <a href="${dashboardUrl}" style="
            display:inline-block;
            background:#F3F4F6;
            color:#374151;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
            border:1px solid #D1D5DB;
          ">Manage Store</a>
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
    subject: `🎉 Store Approved: ${storeName} is Now Live!`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Store paused notification email
 */
export const storePaused = ({
  firstName,
  storeName,
  reason,
  logo,
}: StorePausedVars): TemplateResult => {
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
            <span style="font-size:32px;">⏸️</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Store Paused
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your store <strong>"${storeName}"</strong> has been temporarily paused by our admin team.
    </p>

    ${
      reason
        ? `
    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px 20px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0 0 5px 0; font-size:12px; color:#92400E; font-weight:600;">REASON</p>
          <p style="margin:0; font-size:14px; color:#92400E;">${reason}</p>
        </td>
      </tr>
    </table>
    `
        : ""
    }

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      If you believe this is a mistake or have questions, please contact our support team.
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
    subject: `Store Paused: ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Store reactivated notification email
 */
export const storeReactivated = ({
  firstName,
  storeName,
  logo,
}: StoreReactivatedVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com/dashboard/stores";

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
            <span style="font-size:32px;">▶️</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Store Reactivated!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Great news! Your store <strong>"${storeName}"</strong> has been reactivated and is now live again.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:15px 20px; border-radius:8px; border-left:4px solid #10B981;">
          <p style="margin:0; font-size:14px; color:#065F46;">
            <strong>✅ Your store is back online!</strong><br>
            All your data and settings have been preserved.
          </p>
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
          ">Go to Dashboard</a>
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
    subject: `Store Reactivated: ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Store deleted notification email
 */
export const storeDeleted = ({
  firstName,
  storeName,
  logo,
}: StoreDeletedVars): TemplateResult => {
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
            <span style="font-size:32px;">🗑️</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Store Deleted
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your store <strong>"${storeName}"</strong> has been permanently deleted. This action cannot be undone.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEE2E2; padding:15px 20px; border-radius:8px; border-left:4px solid #EF4444;">
          <p style="margin:0; font-size:14px; color:#991B1B;">
            <strong>⚠️ Important:</strong><br>
            All store data, settings, and associated information have been removed from our system.
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      If you didn't request this deletion or have any questions, please contact our support team immediately.
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
    subject: `Store Deleted: ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};
