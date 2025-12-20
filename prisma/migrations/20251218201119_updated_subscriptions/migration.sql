-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "pending_plan_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_pending_plan_id_fkey" FOREIGN KEY ("pending_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
