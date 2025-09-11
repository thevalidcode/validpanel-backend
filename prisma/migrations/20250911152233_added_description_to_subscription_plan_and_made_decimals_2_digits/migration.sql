/*
  Warnings:

  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `charged_amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `subscription_plans` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "charged_amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."subscription_plans" ADD COLUMN     "description" TEXT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);
