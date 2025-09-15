/*
  Warnings:

  - You are about to drop the `currencies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."currencies";

-- CreateTable
CREATE TABLE "public"."exchange_rates" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rates" JSONB NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_uid_key" ON "public"."exchange_rates"("uid");
