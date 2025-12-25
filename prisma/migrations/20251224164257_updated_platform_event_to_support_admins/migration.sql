-- AlterTable
ALTER TABLE "public"."platform_events" ADD COLUMN     "admin_id" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."platform_events" ADD CONSTRAINT "platform_events_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
