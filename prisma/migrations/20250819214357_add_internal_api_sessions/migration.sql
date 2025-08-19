/*
  Warnings:

  - You are about to drop the column `username` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admins" DROP COLUMN "username";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username";

-- CreateTable
CREATE TABLE "internal_api_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internal_api_sessions_pkey" PRIMARY KEY ("id")
);
