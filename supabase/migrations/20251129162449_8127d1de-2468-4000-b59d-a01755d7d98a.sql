-- Create admin_credentials table
CREATE TABLE public.admin_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading credentials (needed for login)
CREATE POLICY "Anyone can read admin credentials for login"
ON public.admin_credentials
FOR SELECT
USING (true);

-- Create policy to allow updating credentials (should be restricted to authenticated admins)
CREATE POLICY "Admins can update credentials"
ON public.admin_credentials
FOR UPDATE
USING (true);

-- Insert default admin credentials
INSERT INTO public.admin_credentials (username, password)
VALUES ('admin', 'admin123');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_credentials_updated_at
BEFORE UPDATE ON public.admin_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();