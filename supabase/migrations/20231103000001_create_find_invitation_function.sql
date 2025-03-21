
-- Function to find invitations by code with direct SQL
CREATE OR REPLACE FUNCTION public.find_invitation_by_code(code_param TEXT)
RETURNS TABLE (
  id UUID,
  classroom_id UUID,
  invitation_token TEXT,
  status TEXT,
  expires_at TIMESTAMPTZ
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ci.id,
    ci.classroom_id,
    ci.invitation_token,
    ci.status,
    ci.expires_at
  FROM 
    public.class_invitations ci
  WHERE 
    UPPER(TRIM(ci.invitation_token)) = UPPER(TRIM(code_param))
    AND ci.status = 'pending'
    AND (ci.expires_at IS NULL OR ci.expires_at > now());
END;
$$;
