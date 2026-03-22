/*
  Warnings:

  - You are about to drop the column `appliesTo` on the `coupons` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "coupons" DROP COLUMN "appliesTo",
ADD COLUMN     "applies_to" "CouponAppliesTo"[];
