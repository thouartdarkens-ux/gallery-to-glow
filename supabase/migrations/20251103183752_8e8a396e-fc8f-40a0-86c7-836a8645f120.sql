-- Rename password_hash column to password
ALTER TABLE public.users RENAME COLUMN password_hash TO password;

-- Update the test user password to plain text
UPDATE public.users 
SET password = 'hallway' 
WHERE reference_code = 'hallway';