/*
  Warnings:

  - You are about to alter the column `discountAmount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `finalAmount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `discountAmount` on the `subscriptions` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "finalAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "finalAmount" SET DATA TYPE DECIMAL(65,30);
