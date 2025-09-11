-- CreateEnum
CREATE TYPE "public"."SubscriptionPlanStatus" AS ENUM ('active', 'inactive', 'draft');

-- AlterTable
ALTER TABLE "public"."subscription_plans" ADD COLUMN     "status" "public"."SubscriptionPlanStatus" NOT NULL DEFAULT 'active';
