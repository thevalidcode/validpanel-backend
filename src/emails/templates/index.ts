import { LogoVars, TemplateResult } from "../components/EmailLayout";
import {
  forgotPassword,
  passwordChanged,
  ForgotPasswordVars,
  welcomeUser,
  WelcomeUserVars,
} from "./user.templates";
import {
  adminForgotPassword,
  adminPasswordChanged,
  AdminForgotPasswordVars,
} from "./admin.templates";
import {
  contactMessageUserConfirmation,
  contactMessageAdminNotification,
  contactMessageReply,
  ContactMessageUserVars,
  ContactMessageAdminVars,
  ContactMessageReplyVars,
} from "./contact.templates";
import {
  storeCreated,
  storeApproved,
  storePaused,
  storeReactivated,
  storeDeleted,
  StoreCreatedVars,
  StoreApprovedVars,
  StorePausedVars,
  StoreReactivatedVars,
  StoreDeletedVars,
} from "./store.templates";
import {
  subscriptionCreated,
  subscriptionActivated,
  subscriptionUpgrade,
  subscriptionDowngradeScheduled,
  subscriptionRenewed,
  subscriptionExpiring,
  subscriptionExpired,
  subscriptionCancelled,
  SubscriptionCreatedVars,
  SubscriptionActivatedVars,
  SubscriptionUpgradeVars,
  SubscriptionDowngradeScheduledVars,
  SubscriptionRenewedVars,
  SubscriptionExpiringVars,
  SubscriptionExpiredVars,
  SubscriptionCancelledVars,
} from "./subscription.templates";
import {
  paymentSuccess,
  paymentFailed,
  paymentPendingManual,
  paymentRefunded,
  PaymentSuccessVars,
  PaymentFailedVars,
  PaymentPendingManualVars,
  PaymentRefundedVars,
} from "./payment.templates";
import {
  adminNewUser,
  adminNewStore,
  adminNewSubscription,
  adminManualPaymentPending,
  adminPaymentReceived,
  adminStoreApprovalRequired,
  adminSubscriptionsExpiring,
  adminDailySummary,
  adminContactMessage,
  AdminNewUserVars,
  AdminNewStoreVars,
  AdminNewSubscriptionVars,
  AdminManualPaymentPendingVars,
  AdminPaymentReceivedVars,
  AdminStoreApprovalRequiredVars,
  AdminSubscriptionExpiringVars,
  AdminDailySummaryVars,
  AdminContactMessageVars,
} from "./admin-notification.templates";

// Map each template type string to the specific variable type it expects
export interface EmailTemplateVars {
  // User auth templates
  FORGOT_PASSWORD: ForgotPasswordVars;
  PASSWORD_CHANGED: LogoVars;

  // Admin auth templates
  ADMIN_FORGOT_PASSWORD: AdminForgotPasswordVars;
  ADMIN_PASSWORD_CHANGED: LogoVars;

  // Contact templates
  CONTACT_MESSAGE_USER_CONFIRMATION: ContactMessageUserVars;
  CONTACT_MESSAGE_ADMIN_NOTIFICATION: ContactMessageAdminVars;
  CONTACT_MESSAGE_REPLY: ContactMessageReplyVars;

  // Welcome templates
  WELCOME_USER: WelcomeUserVars;

  // Store lifecycle templates
  STORE_CREATED: StoreCreatedVars;
  STORE_APPROVED: StoreApprovedVars;
  STORE_PAUSED: StorePausedVars;
  STORE_REACTIVATED: StoreReactivatedVars;
  STORE_DELETED: StoreDeletedVars;

  // Subscription lifecycle templates
  SUBSCRIPTION_CREATED: SubscriptionCreatedVars;
  SUBSCRIPTION_ACTIVATED: SubscriptionActivatedVars;
  SUBSCRIPTION_UPGRADE: SubscriptionUpgradeVars;
  SUBSCRIPTION_DOWNGRADE_SCHEDULED: SubscriptionDowngradeScheduledVars;
  SUBSCRIPTION_RENEWED: SubscriptionRenewedVars;
  SUBSCRIPTION_EXPIRING: SubscriptionExpiringVars;
  SUBSCRIPTION_EXPIRED: SubscriptionExpiredVars;
  SUBSCRIPTION_CANCELLED: SubscriptionCancelledVars;

  // Payment templates
  PAYMENT_SUCCESS: PaymentSuccessVars;
  PAYMENT_FAILED: PaymentFailedVars;
  PAYMENT_PENDING_MANUAL: PaymentPendingManualVars;
  PAYMENT_REFUNDED: PaymentRefundedVars;

  // Admin notification templates
  ADMIN_NEW_USER: AdminNewUserVars;
  ADMIN_NEW_STORE: AdminNewStoreVars;
  ADMIN_NEW_SUBSCRIPTION: AdminNewSubscriptionVars;
  ADMIN_MANUAL_PAYMENT_PENDING: AdminManualPaymentPendingVars;
  ADMIN_PAYMENT_RECEIVED: AdminPaymentReceivedVars;
  ADMIN_STORE_APPROVAL_REQUIRED: AdminStoreApprovalRequiredVars;
  ADMIN_SUBSCRIPTIONS_EXPIRING: AdminSubscriptionExpiringVars;
  ADMIN_DAILY_SUMMARY: AdminDailySummaryVars;
  ADMIN_CONTACT_MESSAGE: AdminContactMessageVars;
}

// Typed templates for dev-time safety
const typedTemplates: {
  [K in keyof EmailTemplateVars]: (
    vars: EmailTemplateVars[K],
  ) => TemplateResult;
} = {
  // User auth templates
  FORGOT_PASSWORD: forgotPassword,
  PASSWORD_CHANGED: passwordChanged,

  // Admin auth templates
  ADMIN_FORGOT_PASSWORD: adminForgotPassword,
  ADMIN_PASSWORD_CHANGED: adminPasswordChanged,

  // Contact templates
  CONTACT_MESSAGE_USER_CONFIRMATION: contactMessageUserConfirmation,
  CONTACT_MESSAGE_ADMIN_NOTIFICATION: contactMessageAdminNotification,
  CONTACT_MESSAGE_REPLY: contactMessageReply,

  // Welcome templates
  WELCOME_USER: welcomeUser,

  // Store lifecycle templates
  STORE_CREATED: storeCreated,
  STORE_APPROVED: storeApproved,
  STORE_PAUSED: storePaused,
  STORE_REACTIVATED: storeReactivated,
  STORE_DELETED: storeDeleted,

  // Subscription lifecycle templates
  SUBSCRIPTION_CREATED: subscriptionCreated,
  SUBSCRIPTION_ACTIVATED: subscriptionActivated,
  SUBSCRIPTION_UPGRADE: subscriptionUpgrade,
  SUBSCRIPTION_DOWNGRADE_SCHEDULED: subscriptionDowngradeScheduled,
  SUBSCRIPTION_RENEWED: subscriptionRenewed,
  SUBSCRIPTION_EXPIRING: subscriptionExpiring,
  SUBSCRIPTION_EXPIRED: subscriptionExpired,
  SUBSCRIPTION_CANCELLED: subscriptionCancelled,

  // Payment templates
  PAYMENT_SUCCESS: paymentSuccess,
  PAYMENT_FAILED: paymentFailed,
  PAYMENT_PENDING_MANUAL: paymentPendingManual,
  PAYMENT_REFUNDED: paymentRefunded,

  // Admin notification templates
  ADMIN_NEW_USER: adminNewUser,
  ADMIN_NEW_STORE: adminNewStore,
  ADMIN_NEW_SUBSCRIPTION: adminNewSubscription,
  ADMIN_MANUAL_PAYMENT_PENDING: adminManualPaymentPending,
  ADMIN_PAYMENT_RECEIVED: adminPaymentReceived,
  ADMIN_STORE_APPROVAL_REQUIRED: adminStoreApprovalRequired,
  ADMIN_SUBSCRIPTIONS_EXPIRING: adminSubscriptionsExpiring,
  ADMIN_DAILY_SUMMARY: adminDailySummary,
  ADMIN_CONTACT_MESSAGE: adminContactMessage,
};

/**
 * Retrieves and renders the email template for the specified type.
 *
 * @param type - Template type as string
 * @param variables - Variables specific to that template
 * @returns Rendered email HTML and subject
 */
export function getTemplate<K extends keyof EmailTemplateVars>(
  type: K,
  variables: Record<string, any>,
): TemplateResult {
  const templateFn = typedTemplates[type as keyof typeof typedTemplates] as
    | ((vars: Record<string, any>) => TemplateResult)
    | undefined;
  if (!templateFn) {
    throw new Error(`Email template for type "${type}" not found.`);
  }

  return templateFn(variables);
}
