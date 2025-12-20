/*
  Warnings:

  - Added the required column `billing_cycle` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "billing_cycle" "public"."BillingInterval" NOT NULL;
