
-- Make institution_code optional in pending_users table
ALTER TABLE public.pending_users 
ALTER COLUMN institution_code DROP NOT NULL;

-- Update the create_pending_user function to handle optional institution_code properly
CREATE OR REPLACE FUNCTION public.create_pending_user(
  p_email text, 
  p_full_name text, 
  p_role text, 
  p_institution_code text DEFAULT NULL, 
  p_additional_info jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_info JSONB;
  new_pending_user_id UUID;
  admin_ids UUID[];
  admin_id UUID;
  default_school_id UUID;
BEGIN
  -- If institution code is provided, validate it
  IF p_institution_code IS NOT NULL AND p_institution_code != '' THEN
    school_info := validate_institution_code(p_institution_code);
    
    IF NOT (school_info->>'valid')::boolean THEN
      RETURN school_info;
    END IF;
  ELSE
    -- Use default school if no institution code provided
    SELECT id INTO default_school_id FROM public.schools WHERE institution_code = 'LEGACY' LIMIT 1;
    
    school_info := jsonb_build_object(
      'valid', true,
      'school_id', default_school_id,
      'school_name', 'Legacy Data School'
    );
  END IF;
  
  -- Check if user already pending or exists
  IF EXISTS (
    SELECT 1 FROM public.pending_users 
    WHERE email = p_email AND status = 'pending'
  ) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'User already has a pending request');
  END IF;
  
  -- Create pending user (institution_code can now be NULL)
  INSERT INTO public.pending_users (
    email, full_name, role, institution_code, school_id, additional_info
  ) VALUES (
    p_email, p_full_name, p_role, p_institution_code, 
    (school_info->>'school_id')::UUID, p_additional_info
  )
  RETURNING id INTO new_pending_user_id;
  
  -- Get all admins for this school
  SELECT array_agg(user_id) INTO admin_ids
  FROM public.admin_profiles 
  WHERE school_id = (school_info->>'school_id')::UUID;
  
  -- Create notifications for all admins
  IF admin_ids IS NOT NULL THEN
    FOREACH admin_id IN ARRAY admin_ids LOOP
      INSERT INTO public.admin_notifications (
        admin_id, school_id, type, title, message, data
      ) VALUES (
        admin_id,
        (school_info->>'school_id')::UUID,
        'new_signup',
        'New ' || p_role || ' signup request',
        p_full_name || ' (' || p_email || ') has requested to join as a ' || p_role,
        jsonb_build_object(
          'pending_user_id', new_pending_user_id,
          'user_email', p_email,
          'user_name', p_full_name,
          'user_role', p_role
        )
      );
    END LOOP;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'pending_user_id', new_pending_user_id,
    'school_name', school_info->>'school_name',
    'message', 'Request submitted successfully. Admin approval may be required.'
  );
END;
$$;
