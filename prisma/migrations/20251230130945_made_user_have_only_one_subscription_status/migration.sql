/*
  Warnings:

  - A unique constraint covering the columns `[user_id,status]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_status_key" ON "public"."subscriptions"("user_id", "status");
