-- Fix user_id for member with email as user_id
-- Run this SQL directly in your Supabase SQL Editor

UPDATE member 
SET user_id = 'c6a9634d-eb3d-449e-ad89-b9a87c1731e0'
WHERE email = 'shreyansmaloo.1996@gmail.com' 
  AND user_id = 'shreyansmaloo.1996@gmail.com';

-- Verify the fix
SELECT id, user_id, email, first_name, last_name 
FROM member 
WHERE email = 'shreyansmaloo.1996@gmail.com';
