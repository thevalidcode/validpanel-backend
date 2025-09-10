/*
  Warnings:

  - You are about to drop the column `charged_amount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `payment_gateway` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `charged_amount` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."payments" ADD COLUMN     "charged_amount" DECIMAL(65,30) NOT NULL;

-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "charged_amount",
DROP COLUMN "payment_gateway";
