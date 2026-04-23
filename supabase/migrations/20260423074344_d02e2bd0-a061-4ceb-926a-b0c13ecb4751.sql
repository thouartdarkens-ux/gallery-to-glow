CREATE TABLE IF NOT EXISTS public.role_page_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  path text NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, path)
);

ALTER TABLE public.role_page_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view role page access"
ON public.role_page_access FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage role page access"
ON public.role_page_access FOR ALL
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'asst_head_admin'::app_role, 'school_admin'::app_role]))
WITH CHECK (has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'asst_head_admin'::app_role, 'school_admin'::app_role]));

CREATE TRIGGER trg_role_page_access_updated
BEFORE UPDATE ON public.role_page_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_role_page_access_role ON public.role_page_access(role);
CREATE INDEX IF NOT EXISTS idx_role_page_access_path ON public.role_page_access(path);