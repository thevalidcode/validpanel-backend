-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "public"."payments"("status", "created_at");

-- CreateIndex
CREATE INDEX "subscriptions_status_started_at_idx" ON "public"."subscriptions"("status", "started_at");

-- CreateIndex
CREATE INDEX "transactions_status_timestamp_idx" ON "public"."transactions"("status", "timestamp");
