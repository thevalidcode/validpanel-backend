/*
  Warnings:

  - You are about to drop the column `co` on the `payment_gateways` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."payment_gateways" DROP COLUMN "co",
ADD COLUMN     "content" TEXT;
