-- CreateEnum
CREATE TYPE "public"."ContactMessageStatus" AS ENUM ('pending', 'replied', 'resolved');

-- CreateTable
CREATE TABLE "public"."contact_messages" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "public"."ContactMessageStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_uid_key" ON "public"."contact_messages"("uid");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "public"."contact_messages"("status");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "public"."contact_messages"("created_at");
