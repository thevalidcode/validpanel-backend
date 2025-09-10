/*
  Warnings:

  - You are about to drop the column `secret_key` on the `payment_gateways` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."payment_gateways" DROP COLUMN "secret_key",
ADD COLUMN     "encrypted_secret_key" TEXT,
ADD COLUMN     "iv" TEXT;
