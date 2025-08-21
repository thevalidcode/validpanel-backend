-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('active', 'pending', 'inactive', 'disabled');

-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('social_media_store', 'shop', 'digital');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('free', 'starter', 'essesentials', 'pro', 'business', 'empire');

-- CreateEnum
CREATE TYPE "AdminStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('super', 'basic', 'manager', 'support_staff', 'finance_officer', 'service_operator');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Canceled', 'Partial', 'Failed', 'Completed', 'In progress', 'Processing');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "FaqStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "PaymentGatewayStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "PaymentGatewayPlatform" AS ENUM ('manual', 'flutterwave', 'paystack', 'referral');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'pending', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "MessageSenderType" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('success', 'failed', 'completed', 'reversed', 'cancelled');

-- CreateTable
CREATE TABLE "stores" (
    "store_id" INTEGER NOT NULL,
    "uid" TEXT NOT NULL,
    "ssl" BOOLEAN NOT NULL DEFAULT false,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "plan" "UserPlan" NOT NULL DEFAULT 'free',
    "type" "StoreType" NOT NULL,
    "status" "StoreStatus" NOT NULL DEFAULT 'pending',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "ref_code" SERIAL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "plan" "UserPlan" NOT NULL DEFAULT 'free',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "spent" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "ref" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'basic',
    "status" "AdminStatus" NOT NULL DEFAULT 'active',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_uid" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "quantity" INTEGER NOT NULL,
    "start" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "cover_image" TEXT NOT NULL DEFAULT '',
    "status" "BlogStatus" NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quotes" JSONB NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message_id" TEXT,
    "response" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "status" "FaqStatus" NOT NULL DEFAULT 'active',
    "position" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Valid Panel',
    "logo_url" TEXT,
    "favicon_url" TEXT,

    CONSTRAINT "general_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_api_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_api_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gateways" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "platform" "PaymentGatewayPlatform" NOT NULL DEFAULT 'manual',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "signature" TEXT,
    "secret_key" JSONB,
    "image" TEXT NOT NULL,
    "status" "PaymentGatewayStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL,
    "min" DECIMAL(10,2) NOT NULL,
    "max" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "payment_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_codes" (
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "session_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "description" TEXT,
    "user_uid" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "TicketPriority" NOT NULL DEFAULT 'medium',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "ticket_uid" TEXT NOT NULL,
    "sender_uid" TEXT NOT NULL,
    "sender_type" "MessageSenderType" NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TransactionStatus" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "payment_gateway" "PaymentGatewayPlatform" NOT NULL DEFAULT 'manual',
    "charged_amount" DECIMAL(65,30) NOT NULL,
    "user_uid" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "upload_logs" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_uid_key" ON "stores"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_ref_code_key" ON "users"("ref_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "users_api_key_key" ON "users"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "admins_uid_key" ON "admins"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admins_api_key_key" ON "admins"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "orders_uid_key" ON "orders"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_uid_key" ON "blogs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_uid_key" ON "currencies"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_uid_key" ON "email_logs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_uid_key" ON "faqs"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "general_uid_key" ON "general"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gateways_uid_key" ON "payment_gateways"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_uid_key" ON "support_tickets"("uid");

-- CreateIndex
CREATE INDEX "support_tickets_user_uid_idx" ON "support_tickets"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_messages_uid_key" ON "ticket_messages"("uid");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_uid_idx" ON "ticket_messages"("ticket_uid");

-- CreateIndex
CREATE INDEX "ticket_messages_sender_uid_idx" ON "ticket_messages"("sender_uid");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_uid_key" ON "transactions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "upload_logs_uid_key" ON "upload_logs"("uid");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_ref_fkey" FOREIGN KEY ("ref") REFERENCES "users"("ref_code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_uid_fkey" FOREIGN KEY ("ticket_uid") REFERENCES "support_tickets"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
