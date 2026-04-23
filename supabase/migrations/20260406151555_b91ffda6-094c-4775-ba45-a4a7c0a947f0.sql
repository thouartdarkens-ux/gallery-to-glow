
-- Add new role values to existing enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'headmaster';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'asst_head_academic';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'asst_head_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'asst_head_domestic';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'senior_housemaster';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hod';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'subject_teacher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'form_master';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'guidance_counselor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'library_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lab_technician';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'housemaster';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'chaplain';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'bursar';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'internal_auditor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'school_secretary';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supply_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ict_coordinator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'technical_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'domestic_bursar';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'chief_cook';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assistant_cook';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'pantry_steward';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'security_officer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'school_driver';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'general_labourer';

-- Helper function to check if user has ANY of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

-- Create student_pins table
CREATE TABLE public.student_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  pin_hash text NOT NULL,
  must_change boolean NOT NULL DEFAULT true,
  set_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable pgcrypto for PIN hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.student_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view student pins"
ON public.student_pins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can insert student pins"
ON public.student_pins FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update student pins"
ON public.student_pins FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Staff can delete student pins"
ON public.student_pins FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_student_pins_updated_at
BEFORE UPDATE ON public.student_pins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Secure function to verify student PIN
CREATE OR REPLACE FUNCTION public.verify_student_pin(_student_id text, _pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _stored_hash text;
  _must_change boolean;
  _student_name text;
  _student_uuid uuid;
BEGIN
  SELECT s.id, s.name, sp.pin_hash, sp.must_change
  INTO _student_uuid, _student_name, _stored_hash, _must_change
  FROM students s
  LEFT JOIN student_pins sp ON sp.student_id = s.id
  WHERE s.student_id = _student_id;

  IF _student_uuid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Student not found');
  END IF;

  IF _stored_hash IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No PIN set for this student');
  END IF;

  IF _stored_hash = crypt(_pin, _stored_hash) THEN
    RETURN jsonb_build_object(
      'success', true,
      'student_id', _student_uuid,
      'student_name', _student_name,
      'must_change', _must_change
    );
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid PIN');
  END IF;
END;
$$;
