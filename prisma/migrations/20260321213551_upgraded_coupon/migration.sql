/*
  Warnings:

  - Added the required column `autoApply` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isPublic` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "coupons" ADD COLUMN     "autoApply" BOOLEAN NOT NULL,
ADD COLUMN     "contexts" TEXT[],
ADD COLUMN     "highlightText" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL,
ADD COLUMN     "priority" INTEGER NOT NULL;
