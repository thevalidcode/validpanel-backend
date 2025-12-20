/*
  Warnings:

  - Changed the type of `status` on the `email_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('success', 'error');

-- CreateEnum
CREATE TYPE "public"."EmailTemplateType" AS ENUM ('password_reset', 'new_subscription', 'welcome', 'newsletter');

-- AlterTable
ALTER TABLE "public"."email_logs" DROP COLUMN "status",
ADD COLUMN     "status" "public"."EmailStatus" NOT NULL;

-- CreateTable
CREATE TABLE "public"."email_templates" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "type" "public"."EmailTemplateType" NOT NULL,
    "name" TEXT,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_uid_key" ON "public"."email_templates"("uid");
