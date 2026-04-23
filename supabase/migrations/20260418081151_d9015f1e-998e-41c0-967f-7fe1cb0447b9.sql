
CREATE TABLE IF NOT EXISTS public.teaching_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year text NOT NULL DEFAULT '2025/2026',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_user_id, subject_id, class_id, academic_year)
);

ALTER TABLE public.teaching_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view teaching assignments" ON public.teaching_assignments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Academic admins manage teaching assignments" ON public.teaching_assignments
FOR ALL TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role,'asst_head_academic'::app_role,'school_admin'::app_role,'hod'::app_role]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['headmaster'::app_role,'asst_head_academic'::app_role,'school_admin'::app_role,'hod'::app_role]));

CREATE TRIGGER teaching_assignments_updated_at BEFORE UPDATE ON public.teaching_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_teaching_assignments_teacher ON public.teaching_assignments(teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_teaching_assignments_class ON public.teaching_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_teaching_assignments_subject ON public.teaching_assignments(subject_id);
