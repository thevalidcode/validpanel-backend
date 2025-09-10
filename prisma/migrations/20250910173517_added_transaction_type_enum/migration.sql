/*
  Warnings:

  - Added the required column `type` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('subscription_payment', 'subscription_renewal', 'subscription_refund', 'addon_purchase', 'addon_refund', 'manual_credit', 'manual_debit');

-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "type" "public"."TransactionType" NOT NULL;
