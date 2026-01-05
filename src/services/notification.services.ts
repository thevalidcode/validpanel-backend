import { NotificationCategory } from "../../prisma/generated";
import { NotificationType } from "../schemas/notification.schema";

interface NotificationMeta {
  [key: string]: any;
}

export function buildNotification(params: {
  category: NotificationCategory;
  type: NotificationType;
  planName?: string;
  expiresAt?: Date | null;
  status?: "success" | "failed" | "warning";
  meta?: NotificationMeta;
}): {
  category: NotificationCategory;
  title: string;
  message: string;
  meta: NotificationMeta;
} {
  const {
    category,
    type,
    planName,
    expiresAt,
    status = "success",
    meta = {},
  } = params;

  let title = "";
  let message = "";

  switch (category) {
    case "PAYMENT":
      if (status === "success") {
        switch (type) {
          case "SUBSCRIPTION_PAYMENT":
            title = "Subscription Activated";
            message = `Your ${planName} plan is active until ${expiresAt?.toLocaleDateString()}.`;
            break;
          case "SUBSCRIPTION_UPGRADE":
            title = "Subscription Upgrade Successful";
            message = `Your ${planName} plan is active until ${expiresAt?.toLocaleDateString()}.`;
            break;
          case "SUBSCRIPTION_DOWNGRADE":
            title = "Subscription Downgrade Successful";
            message = `Your ${planName} plan is active until ${expiresAt?.toLocaleDateString()}.`;
            break;
          case "SUBSCRIPTION_RENEWAL":
            title = "Subscription Renewed";
            message = `Your ${planName} plan has been renewed until ${expiresAt?.toLocaleDateString()}.`;
            break;
          default:
            title = "Payment Successful";
            message = `Your payment was successful.`;
        }
      } else {
        switch (type) {
          case "SUBSCRIPTION_PAYMENT":
            title = "Subscription Payment Failed";
            message = `Your payment for ${planName} failed.`;
            break;
          case "SUBSCRIPTION_RENEWAL":
            title = "Subscription Renewal Failed";
            message = `Your renewal payment for ${planName} failed.`;
            break;
          case "SUBSCRIPTION_UPGRADE":
            title = "Subscription Upgrade Failed";
            message = `Your upgrade payment for ${planName} failed.`;
            break;
          case "SUBSCRIPTION_DOWNGRADE":
            title = "Subscription Downgrade Failed";
            message = `Your downgrade for ${planName} failed.`;
            break;
          default:
            title = "Payment Failed";
            message = `We couldn’t process your payment.`;
        }
      }
      break;

    case "STORE":
      switch (type) {
        case "STORE_CREATED":
          title = "Store Created";
          message = `Your store has been successfully created, kindly wait for approval.`;
          break;
        case "STORE_APPROVED":
          title = "Store Approved";
          message = `Your store is now live.`;
          break;
        case "STORE_REJECTED":
          title = "Store Rejected";
          message = `Your store submission was rejected.`;
          break;
        case "STORE_PAUSED":
          title = "Store Paused";
          message = `Your store has been paused.`;
          break;
        default:
          title = "Store Update";
          message = `There’s an update regarding your store.`;
      }
      break;

    case "SUBSCRIPTION":
      // could overlap with payment or system notices
      switch (type) {
        case "SUBSCRIPTION_EXPIRED":
          title = "Subscription Expired";
          message = `Your ${planName} subscription expired on ${expiresAt?.toLocaleDateString()}.`;
          break;
        case "SUBSCRIPTION_RENEWAL":
          title = "Subscription Renewal Failed";
          message = `Your renewal for ${planName} was successful.`;
          break;
        default:
          title = "Subscription Notice";
          message = `There’s an update about your subscription.`;
      }
      break;

    default:
      title = "Notification";
      message = "You have a new notification.";
  }

  return {
    category,
    title,
    message,
    meta: { status, type, ...meta },
  };
}
