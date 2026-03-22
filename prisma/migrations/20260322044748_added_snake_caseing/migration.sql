/*
  Warnings:

  - You are about to drop the column `amountInMinor` on the `PlanPrice` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PlanPrice` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `PlanPrice` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `PlanPrice` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `PlanPrice` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `PlanPrice` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PlanPrice` table. All the data in the column will be lost.
  - You are about to drop the column `permissin_id` on the `admin_role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `admin_role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `amountSaved` on the `coupon_redemptions` table. All the data in the column will be lost.
  - You are about to drop the column `couponId` on the `coupon_redemptions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `coupon_redemptions` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `coupon_redemptions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `coupon_redemptions` table. All the data in the column will be lost.
  - You are about to drop the column `couponId` on the `coupon_rules` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `coupon_rules` table. All the data in the column will be lost.
  - You are about to drop the column `planId` on the `coupon_rules` table. All the data in the column will be lost.
  - You are about to drop the column `autoApply` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `firstTimeOnly` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `highlightText` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `maxUses` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `minAmount` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `perUserLimit` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `usedCount` on the `coupons` table. All the data in the column will be lost.
  - You are about to drop the column `couponId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `finalAmount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `ownerId` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `couponId` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `renewalProcessingAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `renewedAt` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `upload_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `upload_logs` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[plan_id,interval,currency]` on the table `PlanPrice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[role_id,permission_id]` on the table `admin_role_permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[coupon_id,user_id]` on the table `coupon_redemptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amount_in_minor` to the `PlanPrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `plan_id` to the `PlanPrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PlanPrice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permission_id` to the `admin_role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `admin_role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_saved` to the `coupon_redemptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coupon_id` to the `coupon_redemptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `coupon_redemptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coupon_id` to the `coupon_rules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auto_apply` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_public` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount_amount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `final_amount` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner_id` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `full_name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlanPrice" DROP CONSTRAINT "PlanPrice_planId_fkey";

-- DropForeignKey
ALTER TABLE "admin_role_permissions" DROP CONSTRAINT "admin_role_permissions_permissin_id_fkey";

-- DropForeignKey
ALTER TABLE "admin_role_permissions" DROP CONSTRAINT "admin_role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "admins" DROP CONSTRAINT "admins_roleId_fkey";

-- DropForeignKey
ALTER TABLE "coupon_redemptions" DROP CONSTRAINT "coupon_redemptions_couponId_fkey";

-- DropForeignKey
ALTER TABLE "coupon_rules" DROP CONSTRAINT "coupon_rules_couponId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_couponId_fkey";

-- DropForeignKey
ALTER TABLE "stores" DROP CONSTRAINT "stores_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_couponId_fkey";

-- DropForeignKey
ALTER TABLE "upload_logs" DROP CONSTRAINT "upload_logs_adminId_fkey";

-- DropForeignKey
ALTER TABLE "upload_logs" DROP CONSTRAINT "upload_logs_userId_fkey";

-- DropIndex
DROP INDEX "PlanPrice_planId_interval_currency_key";

-- DropIndex
DROP INDEX "admin_role_permissions_roleId_permissin_id_key";

-- DropIndex
DROP INDEX "coupon_redemptions_couponId_userId_key";

-- AlterTable
ALTER TABLE "PlanPrice" DROP COLUMN "amountInMinor",
DROP COLUMN "createdAt",
DROP COLUMN "externalId",
DROP COLUMN "isActive",
DROP COLUMN "isDefault",
DROP COLUMN "planId",
DROP COLUMN "updatedAt",
ADD COLUMN     "amount_in_minor" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "external_id" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "plan_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "admin_role_permissions" DROP COLUMN "permissin_id",
DROP COLUMN "roleId",
ADD COLUMN     "permission_id" INTEGER NOT NULL,
ADD COLUMN     "role_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "admins" DROP COLUMN "fullName",
DROP COLUMN "roleId",
ADD COLUMN     "full_name" TEXT NOT NULL,
ADD COLUMN     "role_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "coupon_redemptions" DROP COLUMN "amountSaved",
DROP COLUMN "couponId",
DROP COLUMN "createdAt",
DROP COLUMN "subscriptionId",
DROP COLUMN "userId",
ADD COLUMN     "amount_saved" INTEGER NOT NULL,
ADD COLUMN     "coupon_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subscription_id" INTEGER,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "coupon_rules" DROP COLUMN "couponId",
DROP COLUMN "createdAt",
DROP COLUMN "planId",
ADD COLUMN     "coupon_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "plan_id" INTEGER;

-- AlterTable
ALTER TABLE "coupons" DROP COLUMN "autoApply",
DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "firstTimeOnly",
DROP COLUMN "highlightText",
DROP COLUMN "isActive",
DROP COLUMN "isPublic",
DROP COLUMN "maxUses",
DROP COLUMN "minAmount",
DROP COLUMN "perUserLimit",
DROP COLUMN "startsAt",
DROP COLUMN "updatedAt",
DROP COLUMN "usedCount",
ADD COLUMN     "auto_apply" BOOLEAN NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "first_time_only" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "highlight_text" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_public" BOOLEAN NOT NULL,
ADD COLUMN     "max_uses" INTEGER,
ADD COLUMN     "min_amount" INTEGER,
ADD COLUMN     "per_user_limit" INTEGER,
ADD COLUMN     "starts_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "used_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "couponId",
DROP COLUMN "discountAmount",
DROP COLUMN "finalAmount",
DROP COLUMN "taxAmount",
ADD COLUMN     "coupon_id" INTEGER,
ADD COLUMN     "discount_amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "final_amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "tax_amount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "stores" DROP COLUMN "ownerId",
ADD COLUMN     "owner_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "couponId",
DROP COLUMN "renewalProcessingAt",
DROP COLUMN "renewedAt",
ADD COLUMN     "coupon_id" INTEGER,
ADD COLUMN     "renewal_processing_at" TIMESTAMP(3),
ADD COLUMN     "renewed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "upload_logs" DROP COLUMN "adminId",
DROP COLUMN "userId",
ADD COLUMN     "admin_id" INTEGER,
ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fullName",
ADD COLUMN     "full_name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_plan_id_interval_currency_key" ON "PlanPrice"("plan_id", "interval", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "admin_role_permissions_role_id_permission_id_key" ON "admin_role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_redemptions_coupon_id_user_id_key" ON "coupon_redemptions"("coupon_id", "user_id");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_rules" ADD CONSTRAINT "coupon_rules_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_logs" ADD CONSTRAINT "upload_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_logs" ADD CONSTRAINT "upload_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "admin_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
