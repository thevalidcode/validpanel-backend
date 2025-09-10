/*
  Warnings:

  - The `plan` column on the `stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `plan` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('active', 'expired', 'trial', 'canceled');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('card', 'paypal', 'crypto');

-- CreateEnum
CREATE TYPE "public"."SubscriptionPlanEnum" AS ENUM ('free', 'starter', 'essesentials', 'pro', 'business', 'empire');

-- CreateEnum
CREATE TYPE "public"."OnboardingStep" AS ENUM ('plan', 'payment', 'store_type', 'store_detail', 'branding', 'complete');

-- AlterTable
ALTER TABLE "public"."stores" DROP COLUMN "plan",
ADD COLUMN     "plan" "public"."SubscriptionPlanEnum" NOT NULL DEFAULT 'free';

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "plan",
ADD COLUMN     "onboarding_step" "public"."OnboardingStep" NOT NULL DEFAULT 'plan';

-- DropEnum
DROP TYPE "public"."UserPlan";

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" "public"."SubscriptionPlanEnum" NOT NULL DEFAULT 'free',
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_uid_key" ON "public"."subscription_plans"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_uid_key" ON "public"."subscriptions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "payments_uid_key" ON "public"."payments"("uid");

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
