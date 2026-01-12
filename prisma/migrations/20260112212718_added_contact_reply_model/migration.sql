/*
  Warnings:

  - You are about to drop the `support_tickets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticket_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ContactReplySender" AS ENUM ('USER', 'ADMIN');

-- AlterEnum
ALTER TYPE "ContactMessageStatus" ADD VALUE 'CLOSED';

-- DropForeignKey
ALTER TABLE "ticket_messages" DROP CONSTRAINT "ticket_messages_ticket_uid_fkey";

-- DropTable
DROP TABLE "support_tickets";

-- DropTable
DROP TABLE "ticket_messages";

-- DropEnum
DROP TYPE "MessageSenderType";

-- DropEnum
DROP TYPE "TicketPriority";

-- DropEnum
DROP TYPE "TicketStatus";

-- CreateTable
CREATE TABLE "contact_replies" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "contact_message_id" INTEGER NOT NULL,
    "sender" "ContactReplySender" NOT NULL,
    "sender_name" TEXT,
    "sender_email" TEXT,
    "content" TEXT NOT NULL,
    "html_content" TEXT,
    "email_message_id" TEXT,
    "in_reply_to" TEXT,
    "references" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_replies_uid_key" ON "contact_replies"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "contact_replies_email_message_id_key" ON "contact_replies"("email_message_id");

-- CreateIndex
CREATE INDEX "contact_replies_contact_message_id_idx" ON "contact_replies"("contact_message_id");

-- CreateIndex
CREATE INDEX "contact_replies_email_message_id_idx" ON "contact_replies"("email_message_id");

-- CreateIndex
CREATE INDEX "contact_messages_email_message_id_idx" ON "contact_messages"("email_message_id");

-- AddForeignKey
ALTER TABLE "contact_replies" ADD CONSTRAINT "contact_replies_contact_message_id_fkey" FOREIGN KEY ("contact_message_id") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
