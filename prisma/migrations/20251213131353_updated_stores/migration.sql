/*
  Warnings:

  - Added the required column `color` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logoUrl` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."stores" ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "logoUrl" TEXT NOT NULL;
