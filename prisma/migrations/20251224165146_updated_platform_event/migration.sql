/*
  Warnings:

  - The values [STORE,USER,SUBSCRIPTION,PAYMENT,SYSTEM] on the enum `PlatformEventCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."PlatformEventCategory_new" AS ENUM ('store', 'user', 'admin', 'subscription', 'payment', 'system');
ALTER TABLE "public"."platform_events" ALTER COLUMN "category" TYPE "public"."PlatformEventCategory_new" USING ("category"::text::"public"."PlatformEventCategory_new");
ALTER TYPE "public"."PlatformEventCategory" RENAME TO "PlatformEventCategory_old";
ALTER TYPE "public"."PlatformEventCategory_new" RENAME TO "PlatformEventCategory";
DROP TYPE "public"."PlatformEventCategory_old";
COMMIT;
