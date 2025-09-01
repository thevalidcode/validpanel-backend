/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `admin_roles` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `name` on the `admin_roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."admin_roles" DROP COLUMN "name",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropEnum
DROP TYPE "public"."AdminRoleEnum";

-- CreateIndex
CREATE UNIQUE INDEX "admin_roles_name_key" ON "public"."admin_roles"("name");
