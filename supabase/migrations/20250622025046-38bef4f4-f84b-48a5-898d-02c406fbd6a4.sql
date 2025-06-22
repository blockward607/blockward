
-- Create settings tables for different user types
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, setting_key)
);

-- Create institution code management functions for admins
CREATE OR REPLACE FUNCTION public.admin_create_institution_code(
  p_school_name TEXT,
  p_contact_email TEXT DEFAULT NULL,
  p_admin_name TEXT DEFAULT 'School Administrator'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  new_school_id UUID;
  admin_user_id UUID;
BEGIN
  -- Check if user is admin
  SELECT user_id INTO admin_user_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin';
  
  IF admin_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can create institution codes');
  END IF;
  
  -- Generate new institution code
  new_code := generate_institution_code();
  
  -- Create new school
  INSERT INTO public.schools (
    name, 
    contact_email, 
    institution_code,
    created_by
  ) VALUES (
    p_school_name,
    COALESCE(p_contact_email, 'admin@' || lower(replace(p_school_name, ' ', '')) || '.edu'),
    new_code,
    admin_user_id
  ) RETURNING id INTO new_school_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'institution_code', new_code,
    'school_id', new_school_id,
    'school_name', p_school_name
  );
END;
$$;

-- Create function to get admin institution codes
CREATE OR REPLACE FUNCTION public.get_admin_institution_codes()
RETURNS TABLE(
  id UUID,
  name TEXT,
  institution_code TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ,
  student_count BIGINT,
  teacher_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if user is admin
  SELECT user_id INTO admin_user_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin';
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Only admins can view institution codes';
  END IF;
  
  RETURN QUERY
  SELECT 
    s.id,
    s.name,
    s.institution_code,
    s.contact_email,
    s.created_at,
    COALESCE(student_counts.count, 0) as student_count,
    COALESCE(teacher_counts.count, 0) as teacher_count
  FROM public.schools s
  LEFT JOIN (
    SELECT school_id, COUNT(*) as count
    FROM public.students
    GROUP BY school_id
  ) student_counts ON s.id = student_counts.school_id
  LEFT JOIN (
    SELECT school_id, COUNT(*) as count
    FROM public.teacher_profiles
    GROUP BY school_id
  ) teacher_counts ON s.id = teacher_counts.school_id
  WHERE s.created_by = admin_user_id
  OR EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = admin_user_id AND school_id = s.id
  )
  ORDER BY s.created_at DESC;
END;
$$;

-- Create function to update system settings
CREATE OR REPLACE FUNCTION public.update_system_setting(
  p_setting_key TEXT,
  p_setting_value JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_school_id UUID;
  user_role_val TEXT;
BEGIN
  -- Get user role and school
  SELECT ur.role::TEXT INTO user_role_val
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();
  
  -- Get school ID based on user type
  IF user_role_val = 'admin' THEN
    SELECT school_id INTO user_school_id
    FROM public.admin_profiles
    WHERE user_id = auth.uid();
  ELSIF user_role_val = 'teacher' THEN
    SELECT school_id INTO user_school_id
    FROM public.teacher_profiles
    WHERE user_id = auth.uid();
  ELSE
    SELECT school_id INTO user_school_id
    FROM public.students
    WHERE user_id = auth.uid();
  END IF;
  
  IF user_school_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert setting
  INSERT INTO public.system_settings (school_id, setting_key, setting_value)
  VALUES (user_school_id, p_setting_key, p_setting_value)
  ON CONFLICT (school_id, setting_key)
  DO UPDATE SET 
    setting_value = p_setting_value,
    updated_at = now();
    
  RETURN TRUE;
END;
$$;

-- Create function to get system settings
CREATE OR REPLACE FUNCTION public.get_system_settings()
RETURNS TABLE(setting_key TEXT, setting_value JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_school_id UUID;
  user_role_val TEXT;
BEGIN
  -- Get user role and school
  SELECT ur.role::TEXT INTO user_role_val
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid();
  
  -- Get school ID based on user type
  IF user_role_val = 'admin' THEN
    SELECT school_id INTO user_school_id
    FROM public.admin_profiles
    WHERE user_id = auth.uid();
  ELSIF user_role_val = 'teacher' THEN
    SELECT school_id INTO user_school_id
    FROM public.teacher_profiles
    WHERE user_id = auth.uid();
  ELSE
    SELECT school_id INTO user_school_id
    FROM public.students
    WHERE user_id = auth.uid();
  END IF;
  
  RETURN QUERY
  SELECT ss.setting_key, ss.setting_value
  FROM public.system_settings ss
  WHERE ss.school_id = user_school_id;
END;
$$;

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system_settings
CREATE POLICY "Users can view their school settings" ON public.system_settings
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.admin_profiles WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM public.teacher_profiles WHERE user_id = auth.uid()
      UNION
      SELECT school_id FROM public.students WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage school settings" ON public.system_settings
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.admin_profiles WHERE user_id = auth.uid()
    )
  );
