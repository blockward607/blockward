
-- Update the handle_new_user function to generate truly unique wallet addresses
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role public.app_role;
  unique_address TEXT;
  address_exists BOOLEAN := true;
BEGIN
  -- Determine role from metadata, default to student
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.app_role;
  
  -- Create user role entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET role = user_role;

  -- Create appropriate profile based on role
  IF user_role = 'student' THEN
    -- Create student record with default school if needed
    INSERT INTO public.students (name, user_id, school_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.id,
      (SELECT id FROM public.schools WHERE institution_code = 'LEGACY' LIMIT 1)
    ) ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- Create teacher profile with default school if needed
    INSERT INTO public.teacher_profiles (user_id, full_name, school_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      (SELECT id FROM public.schools WHERE institution_code = 'LEGACY' LIMIT 1)
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Generate unique wallet address
  WHILE address_exists LOOP
    unique_address := substr(md5(random()::text || NEW.id::text || extract(epoch from now())::text), 1, 40);
    SELECT EXISTS(SELECT 1 FROM public.wallets WHERE address = unique_address) INTO address_exists;
  END LOOP;
  
  -- Create wallet with unique address
  INSERT INTO public.wallets (user_id, address, type)
  VALUES (NEW.id, unique_address, 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Update create_pending_user function to make institution code optional
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
  
  -- Create pending user
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
