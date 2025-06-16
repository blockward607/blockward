
-- Drop all policies that depend on the role column
DROP POLICY IF EXISTS "Only teachers can update students" ON public.students;
DROP POLICY IF EXISTS "Teachers can create NFT transactions" ON public.transactions;
DROP POLICY IF EXISTS "Teachers can create NFTs" ON public.nfts;
DROP POLICY IF EXISTS "Teachers can transfer NFTs" ON public.nfts;
DROP POLICY IF EXISTS "Teachers can create transactions" ON public.transactions;
DROP POLICY IF EXISTS "Teachers can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can manage behavior records" ON public.behavior_records;
DROP POLICY IF EXISTS "Teachers can manage classroom students" ON public.classroom_students;
DROP POLICY IF EXISTS "Teachers can manage classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "Teachers can manage students" ON public.students;
DROP POLICY IF EXISTS "Teachers can view and manage students" ON public.students;
DROP POLICY IF EXISTS "Teachers can view student wallets" ON public.wallets;

-- First create the app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- Update user_roles table to use the new enum
ALTER TABLE public.user_roles ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- Recreate the policies that were dropped
CREATE POLICY "Only teachers can update students" ON public.students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can view and manage students" ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can view student wallets" ON public.wallets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can create NFT transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can create transactions" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can create NFTs" ON public.nfts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can transfer NFTs" ON public.nfts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage attendance" ON public.attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage behavior records" ON public.behavior_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage classroom students" ON public.classroom_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

CREATE POLICY "Teachers can manage classrooms" ON public.classrooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'teacher'
    )
  );

-- Create schools table
CREATE TABLE public.schools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  logo_url TEXT,
  domain TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin_profiles table
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  full_name TEXT,
  position TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create year_groups table
CREATE TABLE public.year_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_logs table for admin actions
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for schools
CREATE POLICY "School admins can manage their schools" ON public.schools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.school_id = schools.id AND ap.user_id = auth.uid()
    )
  );

-- Create RLS policies for admin_profiles
CREATE POLICY "Users can view their own admin profile" ON public.admin_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "School admins can manage admin profiles in their school" ON public.admin_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.school_id = admin_profiles.school_id AND ap.user_id = auth.uid()
    )
  );

-- Create RLS policies for year_groups
CREATE POLICY "School admins can manage year groups" ON public.year_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.school_id = year_groups.school_id AND ap.user_id = auth.uid()
    )
  );

-- Create RLS policies for subjects
CREATE POLICY "School admins can manage subjects" ON public.subjects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.school_id = subjects.school_id AND ap.user_id = auth.uid()
    )
  );

-- Create RLS policies for audit_logs
CREATE POLICY "School admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_profiles ap
      WHERE ap.school_id = audit_logs.school_id AND ap.user_id = auth.uid()
    )
  );

-- Add school_id and year_group_id to students table if they don't exist
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id),
ADD COLUMN IF NOT EXISTS year_group_id UUID REFERENCES public.year_groups(id);

-- Add school_id to teacher_profiles table if it doesn't exist
ALTER TABLE public.teacher_profiles 
ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id);
