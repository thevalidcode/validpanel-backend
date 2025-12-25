-- DropForeignKey
ALTER TABLE "public"."upload_logs" DROP CONSTRAINT "upload_logs_userId_fkey";

-- AlterTable
ALTER TABLE "public"."upload_logs" ADD COLUMN     "adminId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."upload_logs" ADD CONSTRAINT "upload_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."upload_logs" ADD CONSTRAINT "upload_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
