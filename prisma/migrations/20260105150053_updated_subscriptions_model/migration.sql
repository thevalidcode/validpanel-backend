-- AlterTable
ALTER TABLE "public"."subscriptions" ADD COLUMN     "renewalProcessingAt" TIMESTAMP(3),
ADD COLUMN     "renewedAt" TIMESTAMP(3);
