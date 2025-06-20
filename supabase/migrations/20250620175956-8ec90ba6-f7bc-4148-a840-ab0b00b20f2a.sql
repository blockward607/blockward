
-- Add institution_code to schools table
ALTER TABLE public.schools 
ADD COLUMN institution_code TEXT UNIQUE;

-- Create function to generate unique institution codes
CREATE OR REPLACE FUNCTION generate_institution_code() 
RETURNS TEXT 
LANGUAGE plpgsql 
AS $$
DECLARE
  chars TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  result TEXT := '';
  i INTEGER;
  code_exists BOOLEAN := true;
BEGIN
  WHILE code_exists LOOP
    result := '';
    FOR i IN 1..6 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    SELECT EXISTS(SELECT 1 FROM public.schools WHERE institution_code = result) INTO code_exists;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Generate codes for existing schools
UPDATE public.schools 
SET institution_code = generate_institution_code() 
WHERE institution_code IS NULL;

-- Create pending_users table for approval workflow
CREATE TABLE public.pending_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  institution_code TEXT NOT NULL,
  school_id UUID REFERENCES public.schools(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  additional_info JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on pending_users
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage pending users from their school
CREATE POLICY "Admins can manage pending users from their school"
ON public.pending_users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid() 
    AND ap.school_id = pending_users.school_id
  )
);

-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  school_id UUID NOT NULL REFERENCES public.schools(id),
  type TEXT NOT NULL CHECK (type IN ('new_signup', 'user_approved', 'user_rejected', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_notifications
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to see their notifications
CREATE POLICY "Admins can view their notifications"
ON public.admin_notifications
FOR SELECT
TO authenticated
USING (admin_id = auth.uid());

-- Function to validate institution code and get school info
CREATE OR REPLACE FUNCTION validate_institution_code(code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_record RECORD;
  result JSONB;
BEGIN
  SELECT id, name, institution_code INTO school_record
  FROM public.schools 
  WHERE institution_code = UPPER(code);
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid institution code');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true, 
    'school_id', school_record.id,
    'school_name', school_record.name,
    'institution_code', school_record.institution_code
  );
END;
$$;

-- Function to create pending user
CREATE OR REPLACE FUNCTION create_pending_user(
  p_email TEXT,
  p_full_name TEXT,
  p_role TEXT,
  p_institution_code TEXT,
  p_additional_info JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_info JSONB;
  new_pending_user_id UUID;
  admin_ids UUID[];
  admin_id UUID;
BEGIN
  -- Validate institution code
  school_info := validate_institution_code(p_institution_code);
  
  IF NOT (school_info->>'valid')::boolean THEN
    RETURN school_info;
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
    'message', 'Request submitted successfully. Admin approval required.'
  );
END;
$$;

-- Function to approve/reject pending user
CREATE OR REPLACE FUNCTION process_pending_user(
  p_pending_user_id UUID,
  p_action TEXT, -- 'approve' or 'reject'
  p_rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pending_user_record RECORD;
  new_user_id UUID;
  result JSONB;
BEGIN
  -- Get pending user info
  SELECT * INTO pending_user_record
  FROM public.pending_users
  WHERE id = p_pending_user_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Pending user not found');
  END IF;
  
  -- Check if current user is admin of the school
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid() AND school_id = pending_user_record.school_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  IF p_action = 'approve' THEN
    -- Create the actual user account
    INSERT INTO auth.users (email, email_confirmed_at, raw_user_meta_data)
    VALUES (
      pending_user_record.email,
      now(),
      jsonb_build_object(
        'full_name', pending_user_record.full_name,
        'role', pending_user_record.role
      )
    )
    RETURNING id INTO new_user_id;
    
    -- Create user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, pending_user_record.role::public.app_role);
    
    -- Create appropriate profile
    IF pending_user_record.role = 'teacher' THEN
      INSERT INTO public.teacher_profiles (user_id, full_name, school_id)
      VALUES (new_user_id, pending_user_record.full_name, pending_user_record.school_id);
    ELSE
      INSERT INTO public.students (user_id, name, school_id)
      VALUES (new_user_id, pending_user_record.full_name, pending_user_record.school_id);
    END IF;
    
    -- Update pending user status
    UPDATE public.pending_users
    SET status = 'approved', approved_by = auth.uid(), approved_at = now()
    WHERE id = p_pending_user_id;
    
    result := jsonb_build_object(
      'success', true,
      'action', 'approved',
      'user_id', new_user_id,
      'message', 'User approved and account created'
    );
    
  ELSE -- reject
    UPDATE public.pending_users
    SET status = 'rejected', approved_by = auth.uid(), approved_at = now(), rejection_reason = p_rejection_reason
    WHERE id = p_pending_user_id;
    
    result := jsonb_build_object(
      'success', true,
      'action', 'rejected',
      'message', 'User request rejected'
    );
  END IF;
  
  RETURN result;
END;
$$;
