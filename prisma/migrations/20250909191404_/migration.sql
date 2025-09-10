/*
  Warnings:

  - The values [inactive] on the enum `StoreStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."StoreStatus_new" AS ENUM ('active', 'pending', 'canceled', 'disabled', 'expired');
ALTER TABLE "public"."stores" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."stores" ALTER COLUMN "status" TYPE "public"."StoreStatus_new" USING ("status"::text::"public"."StoreStatus_new");
ALTER TYPE "public"."StoreStatus" RENAME TO "StoreStatus_old";
ALTER TYPE "public"."StoreStatus_new" RENAME TO "StoreStatus";
DROP TYPE "public"."StoreStatus_old";
ALTER TABLE "public"."stores" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
