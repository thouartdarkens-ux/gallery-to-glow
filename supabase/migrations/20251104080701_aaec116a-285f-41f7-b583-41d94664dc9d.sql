-- Add additional user profile fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS present_address text,
ADD COLUMN IF NOT EXISTS permanent_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS timezone text,
ADD COLUMN IF NOT EXISTS notification_promotional boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_offers boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_recommendations boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;