/*
  Warnings:

  - You are about to drop the column `role` on the `admins` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."AdminRoleEnum" AS ENUM ('super', 'basic', 'manager', 'support_staff', 'finance_officer', 'service_operator');

-- AlterTable
ALTER TABLE "public"."admins" DROP COLUMN "role",
ADD COLUMN     "roleId" INTEGER;

-- DropEnum
DROP TYPE "public"."AdminRole";

-- CreateTable
CREATE TABLE "public"."admin_roles" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" "public"."AdminRoleEnum" NOT NULL DEFAULT 'basic',

    CONSTRAINT "admin_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_permissions" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "admin_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin_role_permissions" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissin_id" INTEGER NOT NULL,

    CONSTRAINT "admin_role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_uid_key" ON "public"."admin_roles"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admin_permissions_uid_key" ON "public"."admin_permissions"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "admin_permissions_name_key" ON "public"."admin_permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "admin_role_permissions_roleId_permissin_id_key" ON "public"."admin_role_permissions"("roleId", "permissin_id");

-- AddForeignKey
ALTER TABLE "public"."admins" ADD CONSTRAINT "admins_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."admin_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."admin_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin_role_permissions" ADD CONSTRAINT "admin_role_permissions_permissin_id_fkey" FOREIGN KEY ("permissin_id") REFERENCES "public"."admin_permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
