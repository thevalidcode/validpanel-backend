/*
  Warnings:

  - Added the required column `collection` to the `upload_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."upload_logs" ADD COLUMN     "collection" TEXT NOT NULL;
