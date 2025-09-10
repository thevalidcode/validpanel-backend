/*
  Warnings:

  - The values [store_type,store_detail,branding] on the enum `OnboardingStep` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."OnboardingStep_new" AS ENUM ('plan', 'payment', 'store_details', 'complete');
ALTER TABLE "public"."users" ALTER COLUMN "onboarding_step" DROP DEFAULT;
ALTER TABLE "public"."users" ALTER COLUMN "onboarding_step" TYPE "public"."OnboardingStep_new" USING ("onboarding_step"::text::"public"."OnboardingStep_new");
ALTER TYPE "public"."OnboardingStep" RENAME TO "OnboardingStep_old";
ALTER TYPE "public"."OnboardingStep_new" RENAME TO "OnboardingStep";
DROP TYPE "public"."OnboardingStep_old";
ALTER TABLE "public"."users" ALTER COLUMN "onboarding_step" SET DEFAULT 'plan';
COMMIT;
