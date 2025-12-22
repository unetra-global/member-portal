-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW');

-- CreateTable
CREATE TABLE "article" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(250) NOT NULL,
    "subtitle" VARCHAR(300),
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "cover_image" TEXT,
    "status" "ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "reading_time" INTEGER NOT NULL DEFAULT 0,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "bookmark_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "last_edited_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "article_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,

    CONSTRAINT "article_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_comment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "article_id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "article_comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "article_slug_key" ON "article"("slug");

-- CreateIndex
CREATE INDEX "article_member_id_idx" ON "article"("member_id");

-- CreateIndex
CREATE INDEX "article_status_idx" ON "article"("status");

-- CreateIndex
CREATE INDEX "article_published_at_idx" ON "article"("published_at");

-- CreateIndex
CREATE INDEX "article_tags_idx" ON "article"("tags");

-- CreateIndex
CREATE UNIQUE INDEX "article_member_id_slug_key" ON "article"("member_id", "slug");

-- CreateIndex
CREATE INDEX "article_version_article_id_idx" ON "article_version"("article_id");

-- CreateIndex
CREATE INDEX "article_comment_article_id_idx" ON "article_comment"("article_id");

-- CreateIndex
CREATE INDEX "article_comment_member_id_idx" ON "article_comment"("member_id");

-- AddForeignKey
ALTER TABLE "article" ADD CONSTRAINT "article_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_version" ADD CONSTRAINT "article_version_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comment" ADD CONSTRAINT "article_comment_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "article_comment" ADD CONSTRAINT "article_comment_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
