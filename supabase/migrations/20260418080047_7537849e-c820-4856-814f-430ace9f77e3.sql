
CREATE TABLE IF NOT EXISTS public.sms_provider_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  api_key text NOT NULL,
  sender_id text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_provider_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sms provider config"
ON public.sms_provider_config FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'school_admin'::app_role, 'ict_coordinator'::app_role]));

CREATE POLICY "Admins can insert sms provider config"
ON public.sms_provider_config FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'school_admin'::app_role, 'ict_coordinator'::app_role]));

CREATE POLICY "Admins can update sms provider config"
ON public.sms_provider_config FOR UPDATE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'school_admin'::app_role, 'ict_coordinator'::app_role]));

CREATE POLICY "Admins can delete sms provider config"
ON public.sms_provider_config FOR DELETE
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'school_admin'::app_role, 'ict_coordinator'::app_role]));

CREATE TRIGGER sms_provider_config_updated_at
BEFORE UPDATE ON public.sms_provider_config
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
