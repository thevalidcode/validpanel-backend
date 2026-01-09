/*
  Warnings:

  - The values [active,inactive,banned] on the enum `AdminStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [monthly,yearly] on the enum `BillingInterval` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `BlogStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,replied,resolved] on the enum `ContactMessageStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [success,error] on the enum `EmailStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `FaqStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [enabled,disabled] on the enum `MaintenanceStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [user,admin] on the enum `MessageSenderType` will be removed. If these variants are still used in the database, this will fail.
  - The values [system,payment,subscription,store,user] on the enum `NotificationCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [plan,payment,store_details,complete] on the enum `OnboardingStep` will be removed. If these variants are still used in the database, this will fail.
  - The values [Pending,Canceled,Partial,Failed,Completed,In progress,Processing] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,disabled] on the enum `PaymentGatewayStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [manual,flutterwave,paystack,cron] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [pending,success,failed] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [store,user,admin,subscription,payment,system] on the enum `PlatformEventCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,pending,canceled,disabled,expired] on the enum `StoreStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [social_media_store,shop,digital] on the enum `StoreType` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive,draft] on the enum `SubscriptionPlanStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,expired,trial,canceled,pending,failed] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [low,medium,high,urgent] on the enum `TicketPriority` will be removed. If these variants are still used in the database, this will fail.
  - The values [open,pending,resolved,closed] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [success,failed,completed,reversed,cancelled,pending] on the enum `TransactionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [subscription_payment,subscription_renewal,subscription_upgrade,subscription_downgrade,manual_credit,manual_debit] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - The values [active,inactive,banned] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdminStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
ALTER TABLE "public"."admins" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "admins" ALTER COLUMN "status" TYPE "AdminStatus_new" USING ("status"::text::"AdminStatus_new");
ALTER TYPE "AdminStatus" RENAME TO "AdminStatus_old";
ALTER TYPE "AdminStatus_new" RENAME TO "AdminStatus";
DROP TYPE "public"."AdminStatus_old";
ALTER TABLE "admins" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BillingInterval_new" AS ENUM ('MONTHLY', 'YEARLY');
ALTER TABLE "subscription_plans" ALTER COLUMN "interval" TYPE "BillingInterval_new" USING ("interval"::text::"BillingInterval_new");
ALTER TABLE "subscriptions" ALTER COLUMN "billing_cycle" TYPE "BillingInterval_new" USING ("billing_cycle"::text::"BillingInterval_new");
ALTER TYPE "BillingInterval" RENAME TO "BillingInterval_old";
ALTER TYPE "BillingInterval_new" RENAME TO "BillingInterval";
DROP TYPE "public"."BillingInterval_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BlogStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."blogs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "blogs" ALTER COLUMN "status" TYPE "BlogStatus_new" USING ("status"::text::"BlogStatus_new");
ALTER TYPE "BlogStatus" RENAME TO "BlogStatus_old";
ALTER TYPE "BlogStatus_new" RENAME TO "BlogStatus";
DROP TYPE "public"."BlogStatus_old";
ALTER TABLE "blogs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ContactMessageStatus_new" AS ENUM ('PENDING', 'REPLIED', 'RESOLVED');
ALTER TABLE "public"."contact_messages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "contact_messages" ALTER COLUMN "status" TYPE "ContactMessageStatus_new" USING ("status"::text::"ContactMessageStatus_new");
ALTER TYPE "ContactMessageStatus" RENAME TO "ContactMessageStatus_old";
ALTER TYPE "ContactMessageStatus_new" RENAME TO "ContactMessageStatus";
DROP TYPE "public"."ContactMessageStatus_old";
ALTER TABLE "contact_messages" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "EmailStatus_new" AS ENUM ('SUCCESS', 'ERROR');
ALTER TABLE "email_logs" ALTER COLUMN "status" TYPE "EmailStatus_new" USING ("status"::text::"EmailStatus_new");
ALTER TYPE "EmailStatus" RENAME TO "EmailStatus_old";
ALTER TYPE "EmailStatus_new" RENAME TO "EmailStatus";
DROP TYPE "public"."EmailStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "FaqStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."faqs" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "faqs" ALTER COLUMN "status" TYPE "FaqStatus_new" USING ("status"::text::"FaqStatus_new");
ALTER TYPE "FaqStatus" RENAME TO "FaqStatus_old";
ALTER TYPE "FaqStatus_new" RENAME TO "FaqStatus";
DROP TYPE "public"."FaqStatus_old";
ALTER TABLE "faqs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MaintenanceStatus_new" AS ENUM ('ENABLED', 'DISABLED');
ALTER TABLE "public"."settings" ALTER COLUMN "maintenance_mode" DROP DEFAULT;
ALTER TABLE "settings" ALTER COLUMN "maintenance_mode" TYPE "MaintenanceStatus_new" USING ("maintenance_mode"::text::"MaintenanceStatus_new");
ALTER TYPE "MaintenanceStatus" RENAME TO "MaintenanceStatus_old";
ALTER TYPE "MaintenanceStatus_new" RENAME TO "MaintenanceStatus";
DROP TYPE "public"."MaintenanceStatus_old";
ALTER TABLE "settings" ALTER COLUMN "maintenance_mode" SET DEFAULT 'DISABLED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "MessageSenderType_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "ticket_messages" ALTER COLUMN "sender_type" TYPE "MessageSenderType_new" USING ("sender_type"::text::"MessageSenderType_new");
ALTER TYPE "MessageSenderType" RENAME TO "MessageSenderType_old";
ALTER TYPE "MessageSenderType_new" RENAME TO "MessageSenderType";
DROP TYPE "public"."MessageSenderType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NotificationCategory_new" AS ENUM ('SYSTEM', 'PAYMENT', 'SUBSCRIPTION', 'STORE', 'USER');
ALTER TABLE "notifications" ALTER COLUMN "category" TYPE "NotificationCategory_new" USING ("category"::text::"NotificationCategory_new");
ALTER TYPE "NotificationCategory" RENAME TO "NotificationCategory_old";
ALTER TYPE "NotificationCategory_new" RENAME TO "NotificationCategory";
DROP TYPE "public"."NotificationCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OnboardingStep_new" AS ENUM ('PLAN', 'PAYMENT', 'STORE_DETAILS', 'COMPLETE');
ALTER TABLE "public"."users" ALTER COLUMN "onboarding_step" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "onboarding_step" TYPE "OnboardingStep_new" USING ("onboarding_step"::text::"OnboardingStep_new");
ALTER TYPE "OnboardingStep" RENAME TO "OnboardingStep_old";
ALTER TYPE "OnboardingStep_new" RENAME TO "OnboardingStep";
DROP TYPE "public"."OnboardingStep_old";
ALTER TABLE "users" ALTER COLUMN "onboarding_step" SET DEFAULT 'PLAN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CANCELED', 'PARTIAL', 'FAILED', 'COMPLETED', 'ACTIVE', 'PROCESSING');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGatewayStatus_new" AS ENUM ('ACTIVE', 'DISABLED');
ALTER TABLE "public"."payment_gateways" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payment_gateways" ALTER COLUMN "status" TYPE "PaymentGatewayStatus_new" USING ("status"::text::"PaymentGatewayStatus_new");
ALTER TYPE "PaymentGatewayStatus" RENAME TO "PaymentGatewayStatus_old";
ALTER TYPE "PaymentGatewayStatus_new" RENAME TO "PaymentGatewayStatus";
DROP TYPE "public"."PaymentGatewayStatus_old";
ALTER TABLE "payment_gateways" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('MANUAL', 'FLUTTERWAVE', 'PAYSTACK', 'CRON');
ALTER TABLE "public"."payment_gateways" ALTER COLUMN "platform" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TABLE "payment_gateways" ALTER COLUMN "platform" TYPE "PaymentMethod_new" USING ("platform"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "payment_gateways" ALTER COLUMN "platform" SET DEFAULT 'MANUAL';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PlatformEventCategory_new" AS ENUM ('STORE', 'USER', 'ADMIN', 'SUBSCRIPTION', 'PAYMENT', 'SYSTEM');
ALTER TABLE "platform_events" ALTER COLUMN "category" TYPE "PlatformEventCategory_new" USING ("category"::text::"PlatformEventCategory_new");
ALTER TYPE "PlatformEventCategory" RENAME TO "PlatformEventCategory_old";
ALTER TYPE "PlatformEventCategory_new" RENAME TO "PlatformEventCategory";
DROP TYPE "public"."PlatformEventCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StoreStatus_new" AS ENUM ('ACTIVE', 'PENDING', 'CANCELED', 'DISABLED', 'EXPIRED');
ALTER TABLE "public"."stores" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stores" ALTER COLUMN "status" TYPE "StoreStatus_new" USING ("status"::text::"StoreStatus_new");
ALTER TYPE "StoreStatus" RENAME TO "StoreStatus_old";
ALTER TYPE "StoreStatus_new" RENAME TO "StoreStatus";
DROP TYPE "public"."StoreStatus_old";
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "StoreType_new" AS ENUM ('SOCIAL', 'SHOP', 'DIGITAL');
ALTER TABLE "stores" ALTER COLUMN "type" TYPE "StoreType_new" USING ("type"::text::"StoreType_new");
ALTER TYPE "StoreType" RENAME TO "StoreType_old";
ALTER TYPE "StoreType_new" RENAME TO "StoreType";
DROP TYPE "public"."StoreType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionPlanStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');
ALTER TABLE "public"."subscription_plans" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subscription_plans" ALTER COLUMN "status" TYPE "SubscriptionPlanStatus_new" USING ("status"::text::"SubscriptionPlanStatus_new");
ALTER TYPE "SubscriptionPlanStatus" RENAME TO "SubscriptionPlanStatus_old";
ALTER TYPE "SubscriptionPlanStatus_new" RENAME TO "SubscriptionPlanStatus";
DROP TYPE "public"."SubscriptionPlanStatus_old";
ALTER TABLE "subscription_plans" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'PENDING', 'FAILED', 'EXPIRED', 'TRIAL', 'CANCELED');
ALTER TABLE "subscriptions" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "public"."SubscriptionStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TicketPriority_new" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
ALTER TABLE "public"."support_tickets" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "support_tickets" ALTER COLUMN "priority" TYPE "TicketPriority_new" USING ("priority"::text::"TicketPriority_new");
ALTER TYPE "TicketPriority" RENAME TO "TicketPriority_old";
ALTER TYPE "TicketPriority_new" RENAME TO "TicketPriority";
DROP TYPE "public"."TicketPriority_old";
ALTER TABLE "support_tickets" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED');
ALTER TABLE "public"."support_tickets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "support_tickets" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "support_tickets" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionStatus_new" AS ENUM ('SUCCESS', 'PENDING', 'FAILED', 'COMPLETED', 'REVERSED', 'CANCELLED');
ALTER TABLE "transactions" ALTER COLUMN "status" TYPE "TransactionStatus_new" USING ("status"::text::"TransactionStatus_new");
ALTER TYPE "TransactionStatus" RENAME TO "TransactionStatus_old";
ALTER TYPE "TransactionStatus_new" RENAME TO "TransactionStatus";
DROP TYPE "public"."TransactionStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('SUBSCRIPTION_PAYMENT', 'SUBSCRIPTION_RENEWAL', 'SUBSCRIPTION_UPGRADE', 'SUBSCRIPTION_DOWNGRADE', 'MANUAL_CREDIT', 'MANUAL_DEBIT');
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "blogs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "contact_messages" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "faqs" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payment_gateways" ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "platform" SET DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "maintenance_mode" SET DEFAULT 'DISABLED';

-- AlterTable
ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "subscription_plans" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "support_tickets" ALTER COLUMN "status" SET DEFAULT 'OPEN',
ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE',
ALTER COLUMN "onboarding_step" SET DEFAULT 'PLAN';
