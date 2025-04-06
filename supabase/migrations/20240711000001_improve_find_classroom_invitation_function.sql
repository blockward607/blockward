
-- Improved function to find invitations with better matching logic
CREATE OR REPLACE FUNCTION public.find_classroom_invitation_matches(code text)
RETURNS TABLE(
  id uuid, 
  invitation_token text, 
  classroom_id uuid, 
  expires_at timestamptz, 
  status text,
  classroom_name text, 
  classroom_description text,
  classroom_teacher_id uuid,
  match_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_upper TEXT := UPPER(TRIM(code));
BEGIN
  -- First try exact match (case insensitive)
  RETURN QUERY
  SELECT 
    ci.id, 
    ci.invitation_token, 
    ci.classroom_id, 
    ci.expires_at, 
    ci.status,
    c.name AS classroom_name, 
    c.description AS classroom_description,
    c.teacher_id AS classroom_teacher_id,
    'exact_match'::TEXT AS match_type
  FROM class_invitations ci
  JOIN classrooms c ON ci.classroom_id = c.id
  WHERE 
    UPPER(TRIM(ci.invitation_token)) = code_upper
    AND ci.status = 'pending'
    AND (ci.expires_at IS NULL OR ci.expires_at > NOW());

  -- If no exact match, try classroom ID
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      NULL::UUID AS id,
      NULL::TEXT AS invitation_token,
      c.id AS classroom_id,
      NULL::TIMESTAMPTZ AS expires_at,
      NULL::TEXT AS status,
      c.name AS classroom_name,
      c.description AS classroom_description,
      c.teacher_id AS classroom_teacher_id,
      'classroom_id_match'::TEXT AS match_type
    FROM classrooms c
    WHERE c.id::TEXT = code;
  END IF;

  -- Try partial match for UK codes (more lenient)
  IF NOT FOUND AND code_upper LIKE 'UK%' THEN
    RETURN QUERY
    SELECT 
      ci.id, 
      ci.invitation_token, 
      ci.classroom_id, 
      ci.expires_at, 
      ci.status,
      c.name AS classroom_name, 
      c.description AS classroom_description,
      c.teacher_id AS classroom_teacher_id,
      'uk_partial_match'::TEXT AS match_type
    FROM class_invitations ci
    JOIN classrooms c ON ci.classroom_id = c.id
    WHERE 
      UPPER(TRIM(ci.invitation_token)) LIKE code_upper || '%'
      AND ci.status = 'pending'
      AND (ci.expires_at IS NULL OR ci.expires_at > NOW())
    ORDER BY length(ci.invitation_token) ASC
    LIMIT 1;
  END IF;
  
  -- If still not found, try with spaces removed
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      ci.id, 
      ci.invitation_token, 
      ci.classroom_id, 
      ci.expires_at, 
      ci.status,
      c.name AS classroom_name, 
      c.description AS classroom_description,
      c.teacher_id AS classroom_teacher_id,
      'normalized_match'::TEXT AS match_type
    FROM class_invitations ci
    JOIN classrooms c ON ci.classroom_id = c.id
    WHERE 
      REPLACE(UPPER(TRIM(ci.invitation_token)), ' ', '') = REPLACE(code_upper, ' ', '')
      AND ci.status = 'pending'
      AND (ci.expires_at IS NULL OR ci.expires_at > NOW())
    LIMIT 1;
  END IF;
END;
$$;
