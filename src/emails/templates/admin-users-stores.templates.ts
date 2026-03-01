import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";
import circularIcon from "./components/circularIcon";

export interface AdminNewUserVars extends LogoVars {
  userName: string;
  userEmail: string;
  registeredAt: string;
}

export interface AdminNewStoreVars extends LogoVars {
  storeName: string;
  storeId: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
}

export interface AdminStoreApprovalRequiredVars extends LogoVars {
  storeName: string;
  storeId: string;
  ownerName: string;
  ownerEmail: string;
  description?: string;
  createdAt: string;
}

export const adminNewUser = ({
  userName,
  userEmail,
  registeredAt,
  logo,
}: AdminNewUserVars): TemplateResult => {
  const adminUrl = "https://validpanel.com/admin/users";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('👤','linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            New User Registration
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">Admin Notification</p>
        </td>
      </tr>
    </table>

    <p style="font-size:15px; line-height:1.6; margin:15px 0; color:#333;">
      A new user has registered on Valid Panel.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:10px; border-left:4px solid #3B82F6;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; width:120px;">Name:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${userName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Email:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">
                <a href="mailto:${userEmail}" style="color:#7C3AED;">${userEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Registered:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${registeredAt}</td>
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
          ">View in Admin Panel</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Admin] New User: ${userName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export const adminNewStore = ({
  storeName,
  storeId,
  ownerName,
  ownerEmail,
  createdAt,
  logo,
}: AdminNewStoreVars): TemplateResult => {
  const adminUrl = `https://validpanel.com/admin/stores/${storeId}`;

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('🏪','linear-gradient(135deg, #10B981 0%, #34D399 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            New Store Created
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">Admin Notification</p>
        </td>
      </tr>
    </table>

    <p style="font-size:15px; line-height:1.6; margin:15px 0; color:#333;">
      A new store has been created on Valid Panel.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:10px; border-left:4px solid #10B981;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; width:120px;">Store Name:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${storeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Store Domain:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-family:monospace;">${storeId}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Owner:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Owner Email:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">
                <a href="mailto:${ownerEmail}" style="color:#7C3AED;">${ownerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Created:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${createdAt}</td>
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
          ">View Store</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Admin] New Store: ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export const adminStoreApprovalRequired = ({
  storeName,
  storeId,
  ownerName,
  ownerEmail,
  description,
  createdAt,
  logo,
}: AdminStoreApprovalRequiredVars): TemplateResult => {
  const approveUrl = `https://validpanel.com/admin/stores/${storeId}/approve`;

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('🔍','linear-gradient(135deg, #EF4444 0%, #F87171 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            Store Approval Required
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">Action Required</p>
        </td>
      </tr>
    </table>

    <p style="font-size:15px; line-height:1.6; margin:15px 0; color:#333;">
      A new store is waiting for your approval before it can go live.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:10px; border-left:4px solid #EF4444;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; width:120px;">Store Name:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${storeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Store Domain:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-family:monospace;">${storeId}</td>
            </tr>
            ${
              description
                ? `
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; vertical-align:top;">Description:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${description}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Owner:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Email:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">
                <a href="mailto:${ownerEmail}" style="color:#7C3AED;">${ownerEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Created:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${createdAt}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${approveUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #10B981 0%, #34D399 100%);
            color:#fff;
            text-decoration:none;
            padding:12px 30px;
            border-radius:8px;
            font-weight:600;
            font-size:14px;
            margin-right:10px;
          ">Approve Store</a>
          <a href="https://validpanel.com/admin/stores/${storeId}" style="
            display:inline-block;
            background:#F3F4F6;
            color:#374151;
            text-decoration:none;
            padding:12px 30px;
            border-radius:8px;
            font-weight:600;
            font-size:14px;
            border:1px solid #D1D5DB;
          ">Review Details</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Action Required] Store Approval: ${storeName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export default adminNewUser;
