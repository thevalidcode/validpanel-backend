-- CreateEnum
CREATE TYPE "CouponAppliesTo" AS ENUM ('NEW', 'RENEWAL', 'UPGRADE');

-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "appliesTo" "CouponAppliesTo"[];
