
-- First, let's ensure the user_roles table has proper RLS policies
-- Enable RLS on user_roles if not already enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own role
CREATE POLICY "Allow users to access their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own role (for account setup)
CREATE POLICY "Allow users to create their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own role
CREATE POLICY "Allow users to update their own role"
ON public.user_roles
FOR UPDATE
USING (auth.uid() = user_id);

-- Ensure the app_role enum exists with all required values
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('student', 'teacher', 'admin');
    END IF;
END $$;

-- Update the user_roles table to use the enum if it's not already
DO $$
BEGIN
    -- Check if the role column is already using the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_roles' 
        AND column_name = 'role' 
        AND udt_name = 'app_role'
    ) THEN
        -- If role column exists but isn't using enum, alter it
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'user_roles' 
            AND column_name = 'role'
        ) THEN
            ALTER TABLE public.user_roles 
            ALTER COLUMN role TYPE public.app_role 
            USING role::public.app_role;
        ELSE
            -- If role column doesn't exist, add it
            ALTER TABLE public.user_roles 
            ADD COLUMN role public.app_role NOT NULL DEFAULT 'student';
        END IF;
    END IF;
END $$;

-- Update the handle_new_user function to ensure it properly creates user roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Determine role from metadata, default to student
  DECLARE
    user_role public.app_role := COALESCE(NEW.raw_user_meta_data->>'role', 'student')::public.app_role;
  BEGIN
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
  END;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
