/*
  Warnings:

  - A unique constraint covering the columns `[store_id]` on the table `reseller_stores` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "reseller_stores" ADD COLUMN     "store_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "reseller_stores_store_id_key" ON "reseller_stores"("store_id");

-- AddForeignKey
ALTER TABLE "reseller_stores" ADD CONSTRAINT "reseller_stores_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("store_id") ON DELETE CASCADE ON UPDATE CASCADE;
