-- Raw SQL migration for Networking Portal schema
-- Enums, tables, foreign keys, indexes, and constraints

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enums
DO $$ BEGIN
  CREATE TYPE member_status AS ENUM ('active','blocked');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE member_tier AS ENUM ('user','member','admin','ops');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Table: category
CREATE TABLE IF NOT EXISTS category (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  field TEXT NOT NULL
);

-- Table: services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID NULL,
  CONSTRAINT services_category_fk FOREIGN KEY (category_id)
    REFERENCES category(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);

-- Table: member
CREATE TABLE IF NOT EXISTS member (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  country TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  experience JSONB NOT NULL,
  years_experience INT NOT NULL,
  join_reason TEXT NOT NULL,
  expectations TEXT NOT NULL,
  additional_info TEXT NOT NULL,
  detailed_profile TEXT NOT NULL,
  uploaded_documents TEXT[] NOT NULL,
  terms_accepted BOOLEAN NOT NULL,
  privacy_accepted BOOLEAN NOT NULL,
  linkedin_url TEXT NOT NULL,
  extracted_from_linkedin BOOLEAN NOT NULL,
  member_status member_status NOT NULL DEFAULT 'active',
  tier member_tier NOT NULL DEFAULT 'user',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NULL
);

-- Table: member_service
CREATE TABLE IF NOT EXISTS member_service (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL,
  service_id UUID NOT NULL,
  is_preferred BOOLEAN NOT NULL,
  is_active BOOLEAN NOT NULL,
  relevant_years_experience INT NOT NULL,
  CONSTRAINT member_service_member_fk FOREIGN KEY (member_id)
    REFERENCES member(id) ON DELETE CASCADE,
  CONSTRAINT member_service_service_fk FOREIGN KEY (service_id)
    REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT member_service_unique UNIQUE (member_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_member_service_member_id ON member_service(member_id);
CREATE INDEX IF NOT EXISTS idx_member_service_service_id ON member_service(service_id);