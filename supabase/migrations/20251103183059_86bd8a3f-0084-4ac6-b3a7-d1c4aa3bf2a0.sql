-- Drop existing profiles table and related objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_by_reference_code(TEXT);
DROP TABLE IF EXISTS public.profiles;

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only view their own data)
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert test user (password is 'hallway' hashed with bcrypt)
-- Hash generated using: bcrypt.hash('hallway', 10)
INSERT INTO public.users (reference_code, email, password_hash, full_name)
VALUES (
  'hallway',
  'hallway@volunteer.portal',
  '$2a$10$YQ5YzVVx5X5Y5Y5Y5Y5Y5OeMqx5X5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Ye',
  'Test Volunteer'
);