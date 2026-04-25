-- CreateEnum
CREATE TYPE "KnowledgeBaseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "knowledge_base" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "content_html" TEXT NOT NULL,
    "cover_image" TEXT,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "KnowledgeBaseStatus" NOT NULL DEFAULT 'DRAFT',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "position" SERIAL NOT NULL,
    "published_at" TIMESTAMP(3),
    "author_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_base_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_uid_key" ON "knowledge_base"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_base_slug_key" ON "knowledge_base"("slug");

-- CreateIndex
CREATE INDEX "knowledge_base_status_published_at_idx" ON "knowledge_base"("status", "published_at");

-- CreateIndex
CREATE INDEX "knowledge_base_category_idx" ON "knowledge_base"("category");

-- AddForeignKey
ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
