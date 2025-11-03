-- Add user stats columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS accumulated_points integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS deducted_points integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS pending_points integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS rank integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS level text DEFAULT 'Support Volunteer',
ADD COLUMN IF NOT EXISTS referrals_count integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Update existing hallway user with stats
UPDATE public.users 
SET 
  accumulated_points = 7235,
  deducted_points = 0,
  total_points = 7235,
  pending_points = 17,
  rank = 3,
  level = 'Active Volunteer',
  referrals_count = 12,
  verified = true,
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
  full_name = 'Grant Reese Arthur'
WHERE reference_code = 'hallway';

-- Insert 3 new random users with stats
INSERT INTO public.users (email, password, reference_code, full_name, accumulated_points, deducted_points, total_points, pending_points, rank, level, referrals_count, verified, avatar_url)
VALUES 
  ('charles.oneli@example.com', 'charles123', 'CHAR001', 'Charles Oneli', 7500, 0, 7500, 5, 1, 'Hallway Star Volunteer', 15, true, 'https://images.unsplash.com/photo-1500000000001?w=200&h=200&fit=crop'),
  ('sylvia.omene@example.com', 'sylvia123', 'SYLV002', 'Sylvia Omene', 6500, 100, 6400, 12, 2, 'Active Volunteer', 10, false, 'https://images.unsplash.com/photo-1500000000002?w=200&h=200&fit=crop'),
  ('jeffrey.appiah@example.com', 'jeffrey123', 'JEFF005', 'Jeffrey Appiah', 5000, 0, 5000, 8, 4, 'Active Volunteer', 7, true, 'https://images.unsplash.com/photo-1500000000005?w=200&h=200&fit=crop');

-- Create RLS policy for users to view all users (for leaderboard)
CREATE POLICY "Users can view all user profiles for leaderboard" 
ON public.users 
FOR SELECT 
USING (true);