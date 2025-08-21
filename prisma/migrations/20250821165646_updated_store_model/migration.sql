/*
  Warnings:

  - You are about to drop the column `approved` on the `stores` table. All the data in the column will be lost.
  - You are about to drop the column `suspended` on the `stores` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stores" DROP COLUMN "approved",
DROP COLUMN "suspended";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "ref_code" DROP NOT NULL;
