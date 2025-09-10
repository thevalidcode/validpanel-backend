/*
  Warnings:

  - The `platform` column on the `payment_gateways` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `payment_gateway` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."payment_gateways" DROP COLUMN "platform",
ADD COLUMN     "platform" "public"."PaymentMethod" NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "payment_gateway",
ADD COLUMN     "payment_gateway" "public"."PaymentMethod" NOT NULL DEFAULT 'manual';

-- DropEnum
DROP TYPE "public"."PaymentGatewayPlatform";
