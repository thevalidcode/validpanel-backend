import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

// ============================================
// INTERFACES
// ============================================

export interface SubscriptionCreatedVars extends LogoVars {
  firstName: string;
  planName: string;
  planPrice: string;
  currency: string;
  interval: "MONTHLY" | "YEARLY";
  paymentMethod: string;
  expiresAt: string;
}

export interface SubscriptionActivatedVars extends LogoVars {
  firstName: string;
  planName: string;
  expiresAt: string;
}

export interface SubscriptionUpgradeVars extends LogoVars {
  firstName: string;
  oldPlanName: string;
  newPlanName: string;
  newPlanPrice: string;
  currency: string;
  proratedAmount?: string;
  expiresAt: string;
}

export interface SubscriptionDowngradeScheduledVars extends LogoVars {
  firstName: string;
  currentPlanName: string;
  newPlanName: string;
  effectiveDate: string;
}

export interface SubscriptionRenewedVars extends LogoVars {
  firstName: string;
  planName: string;
  planPrice: string;
  currency: string;
  renewedAt: string;
  expiresAt: string;
}

export interface SubscriptionExpiringVars extends LogoVars {
  firstName: string;
  planName: string;
  expiresAt: string;
  daysRemaining: number;
}

export interface SubscriptionExpiredVars extends LogoVars {
  firstName: string;
  planName: string;
  expiredAt: string;
}

export interface SubscriptionCancelledVars extends LogoVars {
  firstName: string;
  planName: string;
  cancellationDate: string;
}

// ============================================
// TEMPLATES
// ============================================

/**
 * New subscription created email
 */
export const subscriptionCreated = ({
  firstName,
  planName,
  planPrice,
  currency,
  interval,
  paymentMethod,
  expiresAt,
  logo,
}: SubscriptionCreatedVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com/subscription";
  const intervalText = interval === "MONTHLY" ? "month" : "year";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:70px;
            height:70px;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:32px;">🎯</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Subscription Created!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Thank you for subscribing to Valid Panel! Your <strong>${planName}</strong> subscription has been created.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%); padding:25px; border-radius:12px;">
          <h3 style="color:#7C3AED; margin:0 0 15px 0; font-size:18px;">
            📋 Subscription Details
          </h3>
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:130px;">Plan:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Price:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${currency} ${planPrice}/${intervalText}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Payment Method:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${paymentMethod}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Valid Until:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${expiresAt}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      paymentMethod === "Manual"
        ? `
    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px 20px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0; font-size:14px; color:#92400E;">
            <strong>⏳ Payment Pending</strong><br>
            Your subscription will be activated once we verify your payment. This usually takes 24-48 hours.
          </p>
        </td>
      </tr>
    </table>
    `
        : `
    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:15px 20px; border-radius:8px; border-left:4px solid #10B981;">
          <p style="margin:0; font-size:14px; color:#065F46;">
            <strong>✅ Subscription Active</strong><br>
            Your subscription is now active. Start creating stores and growing your business!
          </p>
        </td>
      </tr>
    </table>
    `
    }

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
          ">View Subscription</a>
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
    subject: `Subscription Created: ${planName} Plan`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Subscription activated (after manual payment approval)
 */
export const subscriptionActivated = ({
  firstName,
  planName,
  expiresAt,
  logo,
}: SubscriptionActivatedVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com";

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
            Subscription Activated!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Great news! Your payment has been verified and your <strong>${planName}</strong> subscription is now active.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:20px; border-radius:12px; border:1px solid #BBF7D0;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:130px;">Plan:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${planName}</td>
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
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Valid Until:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${expiresAt}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      You now have full access to all features included in your plan. Start creating stores and grow your business!
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${dashboardUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #10B981 0%, #34D399 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">Start Building</a>
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
    subject: `🎉 Your ${planName} Subscription is Now Active!`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Subscription upgraded email
 */
export const subscriptionUpgrade = ({
  firstName,
  oldPlanName,
  newPlanName,
  newPlanPrice,
  currency,
  proratedAmount,
  expiresAt,
  logo,
}: SubscriptionUpgradeVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com/subscription";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:70px;
            height:70px;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:32px;">⬆️</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Plan Upgraded!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your subscription has been successfully upgraded from <strong>${oldPlanName}</strong> to <strong>${newPlanName}</strong>.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%); padding:25px; border-radius:12px;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="text-align:center; padding-bottom:15px;">
                <span style="color:#9CA3AF; font-size:14px; text-decoration:line-through;">${oldPlanName}</span>
                <span style="color:#7C3AED; font-size:20px; margin:0 15px;">→</span>
                <span style="color:#7C3AED; font-size:18px; font-weight:700;">${newPlanName}</span>
              </td>
            </tr>
          </table>
          <table role="presentation" style="width:100%; border-collapse:collapse; margin-top:15px; border-top:1px solid #DDD6FE; padding-top:15px;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:130px;">New Price:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${currency} ${newPlanPrice}</td>
            </tr>
            ${
              proratedAmount
                ? `
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Prorated Charge:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${currency} ${proratedAmount}</td>
            </tr>
            `
                : ""
            }
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Valid Until:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${expiresAt}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:15px 20px; border-radius:8px; border-left:4px solid #10B981;">
          <p style="margin:0; font-size:14px; color:#065F46;">
            <strong>✅ Upgrade Applied Immediately</strong><br>
            All new features and limits from your ${newPlanName} plan are now available.
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
          ">View Subscription</a>
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
    subject: `Plan Upgraded to ${newPlanName}!`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Subscription downgrade scheduled email
 */
export const subscriptionDowngradeScheduled = ({
  firstName,
  currentPlanName,
  newPlanName,
  effectiveDate,
  logo,
}: SubscriptionDowngradeScheduledVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com/subscription";

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
            <span style="font-size:32px;">📅</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Downgrade Scheduled
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your subscription downgrade from <strong>${currentPlanName}</strong> to <strong>${newPlanName}</strong> has been scheduled.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:25px; border-radius:12px; border:1px solid #FDE68A;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="text-align:center; padding-bottom:15px;">
                <span style="color:#333; font-size:16px; font-weight:600;">${currentPlanName}</span>
                <span style="color:#F59E0B; font-size:20px; margin:0 15px;">→</span>
                <span style="color:#F59E0B; font-size:16px; font-weight:600;">${newPlanName}</span>
              </td>
            </tr>
          </table>
          <table role="presentation" style="width:100%; border-collapse:collapse; margin-top:15px; border-top:1px solid #FDE68A; padding-top:15px;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Effective Date:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${effectiveDate}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px 20px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0; font-size:14px; color:#92400E;">
            <strong>⚠️ Important:</strong><br>
            You'll continue to have access to your ${currentPlanName} features until ${effectiveDate}. After that, your plan will automatically switch to ${newPlanName}.
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
          ">View Subscription</a>
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
    subject: `Downgrade Scheduled: ${currentPlanName} → ${newPlanName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Subscription renewed email
 */
export const subscriptionRenewed = ({
  firstName,
  planName,
  planPrice,
  currency,
  renewedAt,
  expiresAt,
  logo,
}: SubscriptionRenewedVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com/subscription";

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
            <span style="font-size:32px;">🔄</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Subscription Renewed!
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your <strong>${planName}</strong> subscription has been successfully renewed. Thank you for continuing with Valid Panel!
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#D1FAE5; padding:25px; border-radius:12px; border:1px solid #BBF7D0;">
          <h3 style="color:#065F46; margin:0 0 15px 0; font-size:16px;">
            📋 Renewal Details
          </h3>
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:130px;">Plan:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Amount:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${currency} ${planPrice}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Renewed On:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${renewedAt}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Next Renewal:</td>
              <td style="padding:8px 0; color:#333; font-size:14px; font-weight:600;">${expiresAt}</td>
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
          ">View Subscription</a>
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
    subject: `Subscription Renewed: ${planName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Subscription expiring soon warning email
 */
export const subscriptionExpiring = ({
  firstName,
  planName,
  expiresAt,
  daysRemaining,
  logo,
}: SubscriptionExpiringVars): TemplateResult => {
  const renewUrl = "https://validpanel.com/subscription";

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
            <span style="font-size:32px;">⏰</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Subscription Expiring Soon
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your <strong>${planName}</strong> subscription will expire in <strong>${daysRemaining} day${
    daysRemaining === 1 ? "" : "s"
  }</strong>.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:25px; border-radius:12px; border:1px solid #FDE68A; text-align:center;">
          <p style="margin:0 0 5px 0; font-size:14px; color:#92400E;">Expires On</p>
          <p style="margin:0; font-size:24px; font-weight:700; color:#92400E;">${expiresAt}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px 20px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0; font-size:14px; color:#92400E;">
            <strong>⚠️ What happens when your subscription expires?</strong><br>
            • You won't be able to create new stores<br>
            • Existing stores may be paused<br>
            • Some features will become unavailable
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${renewUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">Renew Now</a>
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
    subject: `⏰ Your ${planName} Subscription Expires in ${daysRemaining} Day${
      daysRemaining === 1 ? "" : "s"
    }`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Subscription expired email
 */
export const subscriptionExpired = ({
  firstName,
  planName,
  expiredAt,
  logo,
}: SubscriptionExpiredVars): TemplateResult => {
  const renewUrl = "https://validpanel.com/subscription";

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
            <span style="font-size:32px;">⚠️</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Subscription Expired
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your <strong>${planName}</strong> subscription has expired on <strong>${expiredAt}</strong>.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEE2E2; padding:15px 20px; border-radius:8px; border-left:4px solid #EF4444;">
          <p style="margin:0; font-size:14px; color:#991B1B;">
            <strong>🚫 Your Account Has Limited Access</strong><br>
            • You cannot create new stores<br>
            • Some existing stores may be paused<br>
            • Premium features are unavailable
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Don't worry! You can renew your subscription anytime to restore full access to all features.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${renewUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">Renew Subscription</a>
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
    subject: `Subscription Expired: ${planName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Subscription cancelled email
 */
export const subscriptionCancelled = ({
  firstName,
  planName,
  cancellationDate,
  logo,
}: SubscriptionCancelledVars): TemplateResult => {
  const pricingUrl = "https://validpanel.com/pricing";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:70px;
            height:70px;
            background:linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:32px;">👋</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:26px; font-weight:700;">
            Subscription Cancelled
          </h1>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Your <strong>${planName}</strong> subscription has been cancelled as of <strong>${cancellationDate}</strong>.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F3F4F6; padding:20px; border-radius:12px; border:1px solid #E5E7EB;">
          <p style="margin:0 0 10px 0; font-size:14px; color:#6B7280;">
            We're sorry to see you go! If you have any feedback about your experience, we'd love to hear it.
          </p>
          <p style="margin:0; font-size:14px; color:#6B7280;">
            Your data will be retained for 30 days in case you decide to come back.
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Changed your mind? You can resubscribe anytime!
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${pricingUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">View Plans</a>
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
    subject: `Subscription Cancelled: ${planName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};
