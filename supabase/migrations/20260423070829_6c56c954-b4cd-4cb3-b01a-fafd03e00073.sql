
-- 1. Add a plain (visible) PIN column so admins can see the PIN
ALTER TABLE public.student_pins ADD COLUMN IF NOT EXISTS pin_plain text;

-- 2. Function: map program name -> short code
CREATE OR REPLACE FUNCTION public.program_code(_program text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _program ILIKE '%general arts%' OR _program ILIKE '%g.%art%' THEN 'GA'
    WHEN _program ILIKE '%general science%' OR _program ILIKE '%g.%sci%' THEN 'GS'
    WHEN _program ILIKE '%science%' THEN 'SC'
    WHEN _program ILIKE '%business%' THEN 'BUS'
    WHEN _program ILIKE '%home eco%' THEN 'HE'
    WHEN _program ILIKE '%visual%' THEN 'VA'
    WHEN _program ILIKE '%agric%' THEN 'AGRIC'
    WHEN _program ILIKE '%technical%' THEN 'TECH'
    ELSE COALESCE(NULLIF(UPPER(LEFT(REGEXP_REPLACE(_program, '[^a-zA-Z]', '', 'g'), 3)), ''), 'GEN')
  END
$$;

-- 3. Function: extract 2-digit year from academic_year like '2025/2026' -> '26'
CREATE OR REPLACE FUNCTION public.academic_year_code(_year text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT RIGHT(COALESCE(SPLIT_PART(_year, '/', 2), TO_CHAR(now(), 'YYYY')), 2)
$$;

-- 4. Generate next student_id atomically (locks rows in same code/year bucket)
CREATE OR REPLACE FUNCTION public.generate_student_id(_program text, _academic_year text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _code text := program_code(_program);
  _yy text := academic_year_code(_academic_year);
  _prefix text := 'ICK/' || _code || '/' || _yy || '/';
  _next int;
BEGIN
  -- Lock rows matching this prefix to prevent race conditions
  PERFORM 1 FROM students WHERE student_id LIKE _prefix || '%' FOR UPDATE;
  SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(SUBSTRING(student_id FROM LENGTH(_prefix) + 1), '[^0-9]', '', 'g'), '')::int), 0) + 1
    INTO _next FROM students WHERE student_id LIKE _prefix || '%';
  RETURN _prefix || LPAD(_next::text, 4, '0');
END;
$$;

-- 5. Generate unique 6-digit PIN
CREATE OR REPLACE FUNCTION public.generate_unique_pin()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _pin text;
  _attempts int := 0;
BEGIN
  LOOP
    _pin := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
    IF NOT EXISTS (SELECT 1 FROM student_pins WHERE pin_plain = _pin) THEN
      RETURN _pin;
    END IF;
    _attempts := _attempts + 1;
    IF _attempts > 100 THEN
      RAISE EXCEPTION 'Could not generate unique PIN after 100 attempts';
    END IF;
  END LOOP;
END;
$$;

-- 6. BEFORE INSERT trigger on students: auto-fill student_id if blank/placeholder
CREATE OR REPLACE FUNCTION public.set_student_id_auto()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.student_id IS NULL OR TRIM(NEW.student_id) = '' OR NEW.student_id ~* '^auto$' THEN
    NEW.student_id := generate_student_id(NEW.program, COALESCE(NEW.academic_year, '2025/2026'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_students_auto_id ON public.students;
CREATE TRIGGER trg_students_auto_id
  BEFORE INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_student_id_auto();

-- 7. AFTER INSERT trigger on students: create student_pins row with auto PIN
CREATE OR REPLACE FUNCTION public.create_student_pin_auto()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _pin text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM student_pins WHERE student_id = NEW.id) THEN
    _pin := generate_unique_pin();
    INSERT INTO student_pins (student_id, pin_hash, pin_plain, must_change)
    VALUES (NEW.id, crypt(_pin, gen_salt('bf')), _pin, false);
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure pgcrypto is available for crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TRIGGER IF EXISTS trg_students_auto_pin ON public.students;
CREATE TRIGGER trg_students_auto_pin
  AFTER INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.create_student_pin_auto();

-- 8. Unique constraint on student_id (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'students_student_id_key'
  ) THEN
    ALTER TABLE public.students ADD CONSTRAINT students_student_id_key UNIQUE (student_id);
  END IF;
END $$;

-- 9. Backfill: regenerate all existing student_ids in new format
DO $$
DECLARE
  _rec RECORD;
  _code text;
  _yy text;
  _prefix text;
  _counter int;
  _last_key text := '';
BEGIN
  -- Use temp table to assign sequential numbers per (code, year) ordered by created_at
  CREATE TEMP TABLE _new_ids ON COMMIT DROP AS
  SELECT
    s.id,
    'ICK/' || program_code(s.program) || '/' || academic_year_code(COALESCE(s.academic_year, '2025/2026')) || '/' ||
      LPAD(ROW_NUMBER() OVER (
        PARTITION BY program_code(s.program), academic_year_code(COALESCE(s.academic_year, '2025/2026'))
        ORDER BY s.created_at, s.id
      )::text, 4, '0') AS new_student_id
  FROM students s;

  -- Two-step update to avoid unique-constraint conflicts mid-update
  UPDATE students s SET student_id = 'TMP_' || s.id::text;
  UPDATE students s SET student_id = n.new_student_id FROM _new_ids n WHERE s.id = n.id;
END $$;

-- 10. Backfill: create PINs for any students missing one
DO $$
DECLARE
  _s RECORD;
  _pin text;
BEGIN
  FOR _s IN SELECT id FROM students WHERE id NOT IN (SELECT student_id FROM student_pins) LOOP
    _pin := generate_unique_pin();
    INSERT INTO student_pins (student_id, pin_hash, pin_plain, must_change)
    VALUES (_s.id, crypt(_pin, gen_salt('bf')), _pin, false);
  END LOOP;

  -- Also fill pin_plain for existing pins that have only the hash (mark as needing reset)
  UPDATE student_pins SET pin_plain = generate_unique_pin() WHERE pin_plain IS NULL;
END $$;
