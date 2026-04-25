-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "coupon_owner_email" TEXT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "reselling_enabled" BOOLEAN NOT NULL DEFAULT false;
