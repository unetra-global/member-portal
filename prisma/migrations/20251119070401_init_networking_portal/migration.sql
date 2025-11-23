-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('active', 'blocked');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('user', 'member', 'admin', 'ops');

-- CreateTable
CREATE TABLE "category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" UUID,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "experience" JSONB NOT NULL,
    "years_experience" INTEGER NOT NULL,
    "join_reason" TEXT NOT NULL,
    "expectations" TEXT NOT NULL,
    "additional_info" TEXT NOT NULL,
    "detailed_profile" TEXT NOT NULL,
    "uploaded_documents" TEXT[],
    "terms_accepted" BOOLEAN NOT NULL,
    "privacy_accepted" BOOLEAN NOT NULL,
    "linkedin_url" TEXT NOT NULL,
    "extracted_from_linkedin" BOOLEAN NOT NULL,
    "member_status" "MemberStatus" NOT NULL DEFAULT 'active',
    "tier" "Tier" NOT NULL DEFAULT 'user',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_service" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "is_preferred" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "relevant_years_experience" INTEGER NOT NULL,

    CONSTRAINT "member_service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");

-- CreateIndex
CREATE INDEX "services_category_id_idx" ON "services"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_email_key" ON "member"("email");

-- CreateIndex
CREATE INDEX "member_service_member_id_idx" ON "member_service"("member_id");

-- CreateIndex
CREATE INDEX "member_service_service_id_idx" ON "member_service"("service_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_service_member_id_service_id_key" ON "member_service"("member_id", "service_id");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_service" ADD CONSTRAINT "member_service_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_service" ADD CONSTRAINT "member_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
