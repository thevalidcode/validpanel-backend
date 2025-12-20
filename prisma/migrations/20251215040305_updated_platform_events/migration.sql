/*
  Warnings:

  - The `category` column on the `platform_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PlatformEventCategory" AS ENUM ('STORE', 'USER', 'SUBSCRIPTION', 'PAYMENT', 'SYSTEM');

-- AlterTable
ALTER TABLE "public"."platform_events" DROP COLUMN "category",
ADD COLUMN     "category" "public"."PlatformEventCategory";
