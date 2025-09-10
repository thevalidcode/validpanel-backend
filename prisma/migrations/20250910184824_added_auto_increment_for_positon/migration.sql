-- AlterTable
CREATE SEQUENCE "public".blogs_position_seq;
ALTER TABLE "public"."blogs" ALTER COLUMN "position" SET DEFAULT nextval('"public".blogs_position_seq');
ALTER SEQUENCE "public".blogs_position_seq OWNED BY "public"."blogs"."position";

-- AlterTable
CREATE SEQUENCE "public".faqs_position_seq;
ALTER TABLE "public"."faqs" ALTER COLUMN "position" SET DEFAULT nextval('"public".faqs_position_seq');
ALTER SEQUENCE "public".faqs_position_seq OWNED BY "public"."faqs"."position";

-- AlterTable
CREATE SEQUENCE "public".payment_gateways_position_seq;
ALTER TABLE "public"."payment_gateways" ALTER COLUMN "position" SET DEFAULT nextval('"public".payment_gateways_position_seq');
ALTER SEQUENCE "public".payment_gateways_position_seq OWNED BY "public"."payment_gateways"."position";
