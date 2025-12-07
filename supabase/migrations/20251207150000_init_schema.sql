-- Consolidated Clean Slate Migration (Fresh Start)
-- This script will ERASE existing application data and schema to start fresh.
-- It drops all known application tables, types, and legacy triggers before recreating the schema.

-- -----------------------------------------------------------------------------
-- 1. AGGRESSIVE CLEANUP (Drop Everything)
-- -----------------------------------------------------------------------------

-- Drop Tables (CASCADE will remove dependent tables/keys)
DROP TABLE IF EXISTS public.member_service CASCADE;
DROP TABLE IF EXISTS public.member CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.category CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE; -- Legacy table

-- Drop Enums/Types
DROP TYPE IF EXISTS public."MemberStatus";
DROP TYPE IF EXISTS public."Tier";

-- Drop Legacy/Conflicting Triggers & Functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. SCHEMA SETUP (Generated from Prisma)
-- -----------------------------------------------------------------------------

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnums
CREATE TYPE "MemberStatus" AS ENUM ('active', 'blocked');
CREATE TYPE "Tier" AS ENUM ('user', 'member', 'admin', 'ops');

-- CreateTable: category
CREATE TABLE "category" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "field" TEXT NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable: services
CREATE TABLE "services" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "category_id" UUID,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable: member
CREATE TABLE "member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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
    "company_name" TEXT,
    "designation" TEXT,
    "licenses" JSONB,
    "awards" JSONB,
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

-- CreateTable: member_service
CREATE TABLE "member_service" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "is_preferred" BOOLEAN NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "relevant_years_experience" INTEGER NOT NULL,

    CONSTRAINT "member_service_pkey" PRIMARY KEY ("id")
);

-- Uniques & Indexes
CREATE UNIQUE INDEX "category_name_key" ON "category"("name");
CREATE UNIQUE INDEX "services_name_key" ON "services"("name");
CREATE INDEX "services_category_id_idx" ON "services"("category_id");
CREATE UNIQUE INDEX "member_email_key" ON "member"("email");
CREATE INDEX "member_service_member_id_idx" ON "member_service"("member_id");
CREATE INDEX "member_service_service_id_idx" ON "member_service"("service_id");
CREATE UNIQUE INDEX "member_service_member_id_service_id_key" ON "member_service"("member_id", "service_id");

-- Foreign Keys
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "member_service" ADD CONSTRAINT "member_service_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "member_service" ADD CONSTRAINT "member_service_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
