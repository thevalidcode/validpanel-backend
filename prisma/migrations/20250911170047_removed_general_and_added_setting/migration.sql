/*
  Warnings:

  - You are about to drop the `general` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."MaintenanceStatus" AS ENUM ('enabled', 'disabled');

-- DropTable
DROP TABLE "public"."general";

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "site_name" TEXT NOT NULL DEFAULT 'Valid Panel',
    "site_description" TEXT,
    "admin_email" TEXT,
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "default_currency" TEXT NOT NULL DEFAULT 'USD',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "default_language" TEXT NOT NULL DEFAULT 'English',
    "date_format" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "maintenance_mode" "public"."MaintenanceStatus" NOT NULL DEFAULT 'disabled',
    "maintenance_msg" TEXT,
    "maintenance_start" TIMESTAMP(3),
    "maintenance_end" TIMESTAMP(3),
    "allowed_ips" JSONB,
    "requests_per_minute" INTEGER NOT NULL DEFAULT 60,
    "requests_per_hour" INTEGER NOT NULL DEFAULT 1000,
    "requests_per_day" INTEGER NOT NULL DEFAULT 10000,
    "max_login_attempts" INTEGER NOT NULL DEFAULT 5,
    "lockout_duration" INTEGER NOT NULL DEFAULT 15,
    "max_file_size_mb" INTEGER NOT NULL DEFAULT 10,
    "uploads_per_hour" INTEGER NOT NULL DEFAULT 20,
    "concurrent_uploads" INTEGER NOT NULL DEFAULT 3,
    "progressive_delays" BOOLEAN NOT NULL DEFAULT true,
    "block_suspicious_ip" BOOLEAN NOT NULL DEFAULT true,
    "send_email_alerts" BOOLEAN NOT NULL DEFAULT true,
    "whitelisted_ips" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_uid_key" ON "public"."settings"("uid");
