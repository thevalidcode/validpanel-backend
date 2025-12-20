/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."stores" DROP COLUMN "logoUrl",
ADD COLUMN     "logo_url" TEXT,
ALTER COLUMN "color" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."subscription_plans" ADD COLUMN     "discount_for_annually" INTEGER,
ADD COLUMN     "tax" INTEGER;
