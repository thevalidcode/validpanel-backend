-- AlterTable
ALTER TABLE "PlanPrice" ADD COLUMN     "tax" INTEGER;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "taxAmount" DECIMAL(10,2);
