/*
  Warnings:

  - You are about to drop the column `encrypted_key` on the `service_api_provders` table. All the data in the column will be lost.
  - You are about to drop the column `iv` on the `service_api_provders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."service_api_provders" DROP COLUMN "encrypted_key",
DROP COLUMN "iv",
ALTER COLUMN "image" DROP NOT NULL;
