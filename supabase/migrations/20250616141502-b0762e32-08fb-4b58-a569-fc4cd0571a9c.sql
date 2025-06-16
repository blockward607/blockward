
-- Create admin role type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('student', 'teacher', 'admin');
    ELSE
        -- Add admin to existing enum if not already there
        BEGIN
            ALTER TYPE user_role_enum ADD VALUE IF NOT EXISTS 'admin';
        EXCEPTION
            WHEN duplicate_object THEN
                NULL; -- Ignore if admin already exists
        END;
    END IF;
END $$;

-- Ensure schools table exists with proper structure
CREATE TABLE IF NOT EXISTS public.schools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    contact_email text,
    domain text,
    address text,
    phone text,
    website text,
    logo_url text,
    settings jsonb DEFAULT '{}'::jsonb,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Ensure admin_profiles table exists
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    full_name text,
    position text DEFAULT 'Administrator',
    permissions jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id)
);

-- Create a default school if none exists
INSERT INTO public.schools (id, name, contact_email, created_by, settings)
SELECT 
    '00000000-0000-0000-0000-000000000001'::uuid,
    'BlockWard School',
    'admin@blockward.edu',
    (SELECT id FROM auth.users LIMIT 1),
    '{}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.schools WHERE id = '00000000-0000-0000-0000-000000000001');

-- Enable RLS on admin tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for schools (admins can see their school)
CREATE POLICY "Admins can view their school" ON public.schools
    FOR SELECT USING (
        id IN (
            SELECT school_id FROM public.admin_profiles 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their school" ON public.schools
    FOR UPDATE USING (
        id IN (
            SELECT school_id FROM public.admin_profiles 
            WHERE user_id = auth.uid()
        )
    );

-- RLS policies for admin_profiles
CREATE POLICY "Admins can view their own profile" ON public.admin_profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can update their own profile" ON public.admin_profiles
    FOR UPDATE USING (user_id = auth.uid());
