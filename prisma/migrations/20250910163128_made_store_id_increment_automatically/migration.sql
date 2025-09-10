-- AlterTable
CREATE SEQUENCE "public".stores_store_id_seq;
ALTER TABLE "public"."stores" ALTER COLUMN "store_id" SET DEFAULT nextval('"public".stores_store_id_seq');
ALTER SEQUENCE "public".stores_store_id_seq OWNED BY "public"."stores"."store_id";
