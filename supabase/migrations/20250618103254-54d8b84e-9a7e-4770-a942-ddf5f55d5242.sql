
-- First, let's temporarily disable foreign key constraints to clean up duplicates
SET session_replication_role = replica;

-- Remove duplicate entries from students table, keeping only the latest one
DELETE FROM public.students 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM public.students 
    ORDER BY user_id, created_at DESC
);

-- Remove duplicate entries from teacher_profiles table, keeping only the latest one
DELETE FROM public.teacher_profiles 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM public.teacher_profiles 
    ORDER BY user_id, created_at DESC
);

-- Remove duplicate entries from wallets table, keeping only the latest one
DELETE FROM public.wallets 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id 
    FROM public.wallets 
    ORDER BY user_id, created_at DESC
);

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;

-- Add unique constraints only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'students_user_id_key' 
        AND conrelid = 'public.students'::regclass
    ) THEN
        ALTER TABLE public.students ADD CONSTRAINT students_user_id_key UNIQUE (user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teacher_profiles_user_id_key' 
        AND conrelid = 'public.teacher_profiles'::regclass
    ) THEN
        ALTER TABLE public.teacher_profiles ADD CONSTRAINT teacher_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'wallets_user_id_key' 
        AND conrelid = 'public.wallets'::regclass
    ) THEN
        ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- Update the handle_new_user function to work properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role public.app_role;
BEGIN
  -- Determine role from metadata, default to student
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.app_role;
  
  -- Create user role entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET role = user_role;

  -- Create appropriate profile based on role
  IF user_role = 'student' THEN
    -- Create student record
    INSERT INTO public.students (name, user_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.id
    ) ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- Create teacher profile for teacher/admin
    INSERT INTO public.teacher_profiles (user_id, full_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Create wallet using MD5 instead of gen_random_bytes
  INSERT INTO public.wallets (user_id, address, type)
  VALUES (NEW.id, substr(md5(random()::text), 1, 40), 'user')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
