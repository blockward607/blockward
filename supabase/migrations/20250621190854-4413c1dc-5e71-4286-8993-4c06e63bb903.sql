
-- First, handle existing NULL school_id values by creating a default school and assigning orphaned records

-- Create a default school for existing orphaned data if it doesn't exist
INSERT INTO public.schools (id, name, contact_email, institution_code, address, phone, website)
SELECT 
  gen_random_uuid(),
  'Legacy Data School',
  'admin@legacyschool.edu',
  'LEGACY',
  '123 Legacy Street',
  '+1-555-0100',
  'https://legacyschool.edu'
WHERE NOT EXISTS (
  SELECT 1 FROM public.schools WHERE institution_code = 'LEGACY'
);

-- Get the default school ID for assignment
DO $$
DECLARE
  default_school_id UUID;
BEGIN
  -- Get the legacy school ID
  SELECT id INTO default_school_id 
  FROM public.schools 
  WHERE institution_code = 'LEGACY';
  
  -- Update all NULL school_id values in students table
  UPDATE public.students 
  SET school_id = default_school_id 
  WHERE school_id IS NULL;
  
  -- Update all NULL school_id values in teacher_profiles table
  UPDATE public.teacher_profiles 
  SET school_id = default_school_id 
  WHERE school_id IS NULL;
  
  -- Update all NULL school_id values in classrooms table
  UPDATE public.classrooms 
  SET school_id = default_school_id 
  WHERE school_id IS NULL;
END $$;

-- Now make the columns NOT NULL since all records have school_id values
ALTER TABLE public.students 
ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE public.teacher_profiles
ALTER COLUMN school_id SET NOT NULL;

ALTER TABLE public.classrooms
ALTER COLUMN school_id SET NOT NULL;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    -- Add foreign key for students.school_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'students_school_id_fkey' 
        AND table_name = 'students'
    ) THEN
        ALTER TABLE public.students 
        ADD CONSTRAINT students_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES public.schools(id);
    END IF;

    -- Add foreign key for teacher_profiles.school_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'teacher_profiles_school_id_fkey' 
        AND table_name = 'teacher_profiles'
    ) THEN
        ALTER TABLE public.teacher_profiles 
        ADD CONSTRAINT teacher_profiles_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES public.schools(id);
    END IF;

    -- Add foreign key for classrooms.school_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'classrooms_school_id_fkey' 
        AND table_name = 'classrooms'
    ) THEN
        ALTER TABLE public.classrooms 
        ADD CONSTRAINT classrooms_school_id_fkey 
        FOREIGN KEY (school_id) REFERENCES public.schools(id);
    END IF;
END $$;

-- Update the promote_user_to_admin function to ensure each admin gets their own school
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
  admin_email TEXT;
BEGIN
  -- Get user email for school creation
  SELECT email INTO admin_email FROM auth.users WHERE id = target_user_id;
  
  -- Create a new school for each admin if school_id_param is not provided
  IF school_id_param IS NULL THEN
    INSERT INTO public.schools (
      name, 
      contact_email, 
      institution_code,
      created_by
    )
    VALUES (
      admin_name || '''s School', 
      COALESCE(admin_email, 'admin@school.edu'),
      generate_institution_code(),
      target_user_id
    )
    RETURNING id INTO target_school_id;
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
