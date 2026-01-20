import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";
import circularIcon from "./components/circularIcon";

export interface AdminNewSubscriptionVars extends LogoVars {
  storeName: string;
  storeId: string;
  planName: string;
  amount: string;
  currency: string;
  ownerName: string;
  ownerEmail: string;
  subscribedAt: string;
}

export interface AdminSubscriptionExpiringVars extends LogoVars {
  expiringCount: number;
  stores: Array<{
    storeName: string;
    storeId: string;
    ownerEmail: string;
    planName: string;
    expiresAt: string;
  }>;
}

export const adminNewSubscription = ({
  storeName,
  storeId,
  planName,
  amount,
  currency,
  ownerName,
  ownerEmail,
  subscribedAt,
  logo,
}: AdminNewSubscriptionVars): TemplateResult => {
  const adminUrl = `https://validpanel.com/admin/stores/${storeId}/subscription`;

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('💎','linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            New Subscription
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">Admin Notification</p>
        </td>
      </tr>
    </table>

    <p style="font-size:15px; line-height:1.6; margin:15px 0; color:#333;">
      A new subscription has been created.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#EDE9FE; padding:15px; border-radius:10px; text-align:center;">
          <p style="margin:0 0 5px 0; font-size:12px; color:#7C3AED;">Revenue</p>
          <p style="margin:0; font-size:28px; font-weight:700; color:#7C3AED;">${currency} ${amount}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:10px; border-left:4px solid #7C3AED;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px; width:120px;">Store:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-weight:600;">${storeName}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Store ID:</td>
              <td style="padding:6px 0; color:#333; font-size:14px; font-family:monospace;">${storeId}</td>
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
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Date:</td>
              <td style="padding:6px 0; color:#333; font-size:14px;">${subscribedAt}</td>
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
          ">View Subscription</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Admin] New Subscription: ${storeName} - ${planName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export const adminSubscriptionsExpiring = ({
  expiringCount,
  stores,
  logo,
}: AdminSubscriptionExpiringVars): TemplateResult => {
  const adminUrl = "https://validpanel.com/admin/subscriptions?status=expiring";

  const storeRows = stores
    .map(
      (store) => `
    <tr>
      <td style="padding:10px; border-bottom:1px solid #E5E7EB; font-size:13px;">${store.storeName}</td>
      <td style="padding:10px; border-bottom:1px solid #E5E7EB; font-size:13px;">${store.planName}</td>
      <td style="padding:10px; border-bottom:1px solid #E5E7EB; font-size:13px;">${store.expiresAt}</td>
    </tr>
  `
    )
    .join("");

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon('⏰','linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)')}
          <h1 style="color:#1F2937; margin:0 0 5px 0; font-size:22px; font-weight:700;">
            Subscriptions Expiring Soon
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">
            ${expiringCount} subscription${expiringCount > 1 ? "s" : ""} expiring in the next 7 days
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px; border-radius:10px; text-align:center;">
          <p style="margin:0; font-size:36px; font-weight:700; color:#92400E;">${expiringCount}</p>
          <p style="margin:5px 0 0 0; font-size:12px; color:#92400E;">Expiring Soon</p>
        </td>
      </tr>
    </table>

    <table style="width:100%; margin:20px 0; border-collapse:collapse; border:1px solid #E5E7EB; border-radius:8px;">
      <thead>
        <tr style="background:#F3F4F6;">
          <th style="padding:12px 10px; text-align:left; font-size:13px; font-weight:600; color:#374151;">Store</th>
          <th style="padding:12px 10px; text-align:left; font-size:13px; font-weight:600; color:#374151;">Plan</th>
          <th style="padding:12px 10px; text-align:left; font-size:13px; font-weight:600; color:#374151;">Expires</th>
        </tr>
      </thead>
      <tbody>
        ${storeRows}
      </tbody>
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
          ">View All Expiring</a>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: `[Admin] ${expiringCount} Subscription${expiringCount > 1 ? "s" : ""} Expiring Soon`,
    children: bodyContent,
    logoUrl: logo,
  });
};

export default adminNewSubscription;
