-- Fix member table unique constraint
-- This migration removes the email unique constraint and adds user_id unique constraint
-- to allow profile updates while preventing duplicate user profiles

-- Drop the email unique constraint
DROP INDEX IF EXISTS "member_email_key";

-- Add user_id unique constraint (each user should only have one profile)
CREATE UNIQUE INDEX IF NOT EXISTS "member_user_id_key" ON "member"("user_id");
