/*
  Warnings:

  - Added the required column `updated_at` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."admins" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."settings" ADD COLUMN     "stale_item_threshold" INTEGER DEFAULT 7;

-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
