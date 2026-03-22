/*
  Warnings:

  - You are about to drop the column `created_at` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `discount_for_annually` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `interval` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subscription_plans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "created_at",
DROP COLUMN "currency",
DROP COLUMN "discount_for_annually",
DROP COLUMN "interval",
DROP COLUMN "price",
DROP COLUMN "tax",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "PlanPrice" (
    "id" SERIAL NOT NULL,
    "planId" INTEGER NOT NULL,
    "interval" "BillingInterval" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "amountInMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "externalId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanPrice_planId_interval_currency_key" ON "PlanPrice"("planId", "interval", "currency");

-- AddForeignKey
ALTER TABLE "PlanPrice" ADD CONSTRAINT "PlanPrice_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
