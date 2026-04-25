-- CreateTable
CREATE TABLE "reseller_stores" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "image" TEXT,
    "type" "StoreType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reseller_stores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reseller_stores_uid_key" ON "reseller_stores"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_stores_url_key" ON "reseller_stores"("url");
