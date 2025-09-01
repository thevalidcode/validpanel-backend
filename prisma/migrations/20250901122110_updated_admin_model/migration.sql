/*
  Warnings:

  - Made the column `roleId` on table `admins` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."admins" DROP CONSTRAINT "admins_roleId_fkey";

-- AlterTable
ALTER TABLE "public"."admins" ALTER COLUMN "roleId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."admins" ADD CONSTRAINT "admins_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
