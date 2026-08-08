ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS principal_name text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS postal_address text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS established_year text;

ALTER TABLE public.placements
  ADD COLUMN IF NOT EXISTS phone text;

CREATE OR REPLACE FUNCTION public.clear_cycle_data(p_school_id integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_placements integer; v_students integer; v_records integer; v_tokens integer;
BEGIN
IF p_school_id IS NULL OR p_school_id <= 0 THEN
RETURN jsonb_build_object('error', 'Invalid school id');
END IF;

SELECT count(*) INTO v_placements FROM placements WHERE school_id = p_school_id;
SELECT count(*) INTO v_students FROM students WHERE school_id = p_school_id;
SELECT count(*) INTO v_records FROM student_records WHERE school_id = p_school_id;
SELECT count(*) INTO v_tokens FROM admission_tokens WHERE school_id = p_school_id;

DELETE FROM guardians WHERE student_id IN (SELECT id FROM students WHERE school_id = p_school_id);
DELETE FROM placements WHERE school_id = p_school_id;
DELETE FROM students WHERE school_id = p_school_id;
DELETE FROM student_records WHERE school_id = p_school_id;
DELETE FROM admission_tokens WHERE school_id = p_school_id;

RETURN jsonb_build_object(
'status', 'ok',
'cleared', jsonb_build_object(
'placements', v_placements, 'students', v_students,
'records', v_records, 'tokens', v_tokens
)
);
END;
$function$;