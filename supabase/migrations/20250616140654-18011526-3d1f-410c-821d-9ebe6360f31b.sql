
-- Step 1: Create a default school for existing users
INSERT INTO public.schools (id, name, contact_email, created_by, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default School',
  'admin@defaultschool.edu',
  (SELECT id FROM auth.users LIMIT 1),
  '{}'::jsonb
);

-- Step 2: Update all existing teacher profiles to reference the default school
UPDATE public.teacher_profiles 
SET school_id = '00000000-0000-0000-0000-000000000001'
WHERE school_id IS NULL;

-- Step 3: Update all existing student records to reference the default school
UPDATE public.students 
SET school_id = '00000000-0000-0000-0000-000000000001'
WHERE school_id IS NULL;

-- Step 4: Update all existing admin profiles to reference the default school
UPDATE public.admin_profiles 
SET school_id = '00000000-0000-0000-0000-000000000001'
WHERE school_id IS NULL;

-- Step 5: Create admin profile for any admin users who don't have one yet
INSERT INTO public.admin_profiles (user_id, school_id, full_name, position, permissions)
SELECT 
  ur.user_id,
  '00000000-0000-0000-0000-000000000001',
  'Administrator',
  'School Admin',
  '{}'::jsonb
FROM public.user_roles ur
WHERE ur.role = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM public.admin_profiles ap 
  WHERE ap.user_id = ur.user_id
);
