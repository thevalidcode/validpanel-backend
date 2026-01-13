import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

// ============================================
// INTERFACES
// ============================================

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

export interface AdminStoreApprovalRequiredVars extends LogoVars {
  storeName: string;
  storeId: string;
  ownerName: string;
  ownerEmail: string;
  description?: string;
  createdAt: string;
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

// ============================================
// TEMPLATES
// ============================================

/**
 * Admin notification: New user registered
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">👤</span>
          </div>
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

/**
 * Admin notification: New store created
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #10B981 0%, #34D399 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">🏪</span>
          </div>
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
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Store ID:</td>
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

/**
 * Admin notification: New subscription created
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">💎</span>
          </div>
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

/**
 * Admin notification: Manual payment pending approval
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">⏳</span>
          </div>
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

/**
 * Admin notification: Payment received
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #10B981 0%, #34D399 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">💰</span>
          </div>
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

/**
 * Admin notification: Store requires approval
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #EF4444 0%, #F87171 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">🔍</span>
          </div>
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
              <td style="padding:6px 0; color:#6B7280; font-size:13px;">Store ID:</td>
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

/**
 * Admin notification: Subscriptions expiring soon summary
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">⏰</span>
          </div>
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

/**
 * Admin notification: Daily summary report
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">📊</span>
          </div>
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

/**
 * Admin notification: New contact message received
 */
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
          <div style="
            width:60px;
            height:60px;
            background:linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
            border-radius:50%;
            margin:0 auto 15px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:28px;">✉️</span>
          </div>
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
