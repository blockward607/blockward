
-- First, let's create a default school if none exists
INSERT INTO public.schools (id, name, contact_email, address, phone, website, created_by)
SELECT 
  gen_random_uuid(),
  'Default School',
  'admin@defaultschool.edu',
  '123 Education Street',
  '+1-555-0123',
  'https://defaultschool.edu',
  NULL
WHERE NOT EXISTS (SELECT 1 FROM public.schools LIMIT 1);

-- Create a function to promote a user to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(
  target_user_id UUID,
  school_id_param UUID DEFAULT NULL,
  admin_name TEXT DEFAULT 'School Administrator',
  admin_position TEXT DEFAULT 'Administrator'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  default_school_id UUID;
  target_school_id UUID;
BEGIN
  -- Get or create default school
  IF school_id_param IS NULL THEN
    SELECT id INTO default_school_id 
    FROM public.schools 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF default_school_id IS NULL THEN
      INSERT INTO public.schools (name, contact_email)
      VALUES ('Default School', 'admin@school.edu')
      RETURNING id INTO default_school_id;
    END IF;
    
    target_school_id := default_school_id;
  ELSE
    target_school_id := school_id_param;
  END IF;

  -- Create or update user role to admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

  -- Create admin profile
  INSERT INTO public.admin_profiles (user_id, school_id, full_name, position, permissions)
  VALUES (
    target_user_id, 
    target_school_id, 
    admin_name, 
    admin_position,
    '{"manage_teachers": true, "manage_students": true, "manage_classes": true, "manage_settings": true}'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE SET
    school_id = target_school_id,
    full_name = admin_name,
    position = admin_position,
    permissions = '{"manage_teachers": true, "manage_students": true, "manage_classes": true, "manage_settings": true}'::jsonb;

  RETURN TRUE;
END;
$$;

-- Create a function to check if a user can become admin (for security)
CREATE OR REPLACE FUNCTION public.can_promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
  already_admin BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE id = target_user_id
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if already admin
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = target_user_id AND role = 'admin'
  ) INTO already_admin;
  
  -- Allow promotion if not already admin
  RETURN NOT already_admin;
END;
$$;
