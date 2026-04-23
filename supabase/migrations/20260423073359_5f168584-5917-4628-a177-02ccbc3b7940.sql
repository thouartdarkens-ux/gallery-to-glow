-- Link table: which subjects belong to which programme (department)
CREATE TABLE IF NOT EXISTS public.department_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (department_id, subject_id)
);

ALTER TABLE public.department_subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view department subjects"
  ON public.department_subjects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Academic admins manage department subjects"
  ON public.department_subjects FOR ALL TO authenticated
  USING (has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'asst_head_academic'::app_role, 'school_admin'::app_role, 'hod'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['headmaster'::app_role, 'asst_head_academic'::app_role, 'school_admin'::app_role, 'hod'::app_role]));

-- Link students to a programme (department) for subject inheritance
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_students_department_id ON public.students(department_id);
CREATE INDEX IF NOT EXISTS idx_department_subjects_dept ON public.department_subjects(department_id);