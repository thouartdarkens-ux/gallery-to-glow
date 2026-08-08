-- Hide schools.credentials from public/authenticated readers via column-level grants
REVOKE SELECT ON public.schools FROM anon, authenticated;
GRANT SELECT (id, region_id, code, name, town, category, school_type, motto, created_at, updated_at,
  admission_letter_path, prospectus_path, personal_records_form_path, undertaking_form_path,
  programme_subjects_path, admission_letter_template) ON public.schools TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;

CREATE OR REPLACE FUNCTION public.verify_school_login(p_school_id integer, p_code text, p_credentials text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_school record;
BEGIN
  IF p_school_id IS NULL OR p_code IS NULL OR btrim(p_code) = '' OR p_credentials IS NULL OR btrim(p_credentials) = '' THEN
    RETURN jsonb_build_object('error', 'School ID, school code and credentials are all required');
  END IF;

  SELECT INTO v_school s.id, s.code, s.name, s.town, s.category, s.school_type, s.motto, s.region_id
  FROM schools s
  WHERE s.id = p_school_id
    AND upper(btrim(s.code)) = upper(btrim(p_code))
    AND s.credentials IS NOT NULL
    AND btrim(s.credentials) = btrim(p_credentials);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Invalid school ID, code or credentials');
  END IF;

  RETURN jsonb_build_object(
    'status', 'ok',
    'school', jsonb_build_object(
      'id', v_school.id, 'code', v_school.code, 'name', v_school.name,
      'town', v_school.town, 'category', v_school.category,
      'school_type', v_school.school_type, 'motto', v_school.motto
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.verify_school_login(integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_school_login(integer, text, text) TO service_role;
