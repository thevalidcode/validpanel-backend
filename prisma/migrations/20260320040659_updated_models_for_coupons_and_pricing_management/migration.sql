/*
  Warnings:

  - You are about to drop the column `discountAmount` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `finalAmount` on the `subscriptions` table. All the data in the column will be lost.
  - Made the column `discountAmount` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `finalAmount` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "discountAmount" SET NOT NULL,
ALTER COLUMN "finalAmount" SET NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "discountAmount",
DROP COLUMN "finalAmount";
