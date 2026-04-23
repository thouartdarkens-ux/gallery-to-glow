
CREATE TABLE public.school_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read settings
CREATE POLICY "Staff can view settings"
ON public.school_settings FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage settings"
ON public.school_settings FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'school_admin'::app_role, 'asst_head_admin'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'school_admin'::app_role, 'asst_head_admin'::app_role]));

-- Seed the default academic year
INSERT INTO public.school_settings (key, value) VALUES ('academic_year', '2025/2026');
