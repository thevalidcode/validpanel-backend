/*
  Warnings:

  - Changed the type of `plan` on the `stores` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `features` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interval` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `name` on the `subscription_plans` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."BillingInterval" AS ENUM ('monthly', 'yearly');

-- AlterTable
ALTER TABLE "public"."stores" DROP COLUMN "plan",
ADD COLUMN     "plan" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."subscription_plans" ADD COLUMN     "features" JSONB NOT NULL,
ADD COLUMN     "interval" "public"."BillingInterval" NOT NULL,
DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."SubscriptionPlanEnum";
