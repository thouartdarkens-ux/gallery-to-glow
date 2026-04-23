
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text,
  hod_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view departments" ON public.departments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Academic admins manage departments" ON public.departments
FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role,'asst_head_academic'::app_role,'school_admin'::app_role,'hod'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role,'asst_head_academic'::app_role,'school_admin'::app_role,'hod'::app_role]));

CREATE POLICY "Staff can view subjects" ON public.subjects
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Academic admins manage subjects" ON public.subjects
FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role,'asst_head_academic'::app_role,'school_admin'::app_role,'hod'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role,'asst_head_academic'::app_role,'school_admin'::app_role,'hod'::app_role]));

CREATE TRIGGER departments_updated_at BEFORE UPDATE ON public.departments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER subjects_updated_at BEFORE UPDATE ON public.subjects
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
