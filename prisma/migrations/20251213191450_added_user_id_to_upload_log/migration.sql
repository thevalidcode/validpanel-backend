/*
  Warnings:

  - Added the required column `userId` to the `upload_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."upload_logs" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."upload_logs" ADD CONSTRAINT "upload_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
